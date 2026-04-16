import { PostStatus, PublicationStatus } from "@prisma/client";
import { Worker } from "bullmq";

import { prisma } from "../lib/db";
import { publishToPlatform } from "../lib/publishers";
import {
  getRedisConnection,
  PUBLICATION_QUEUE_NAME,
  type PublicationJobData,
} from "../lib/queue";

const redisConnection = getRedisConnection();

async function processPublicationJob(data: PublicationJobData) {
  const post = await prisma.post.findUnique({
    where: { id: data.postId },
    include: {
      user: {
        include: {
          socialConnections: true,
        },
      },
      targets: true,
      media: {
        include: {
          media: true,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!post) {
    return;
  }

  if (!post.targets.length) {
    await prisma.post.update({
      where: { id: post.id },
      data: { status: PostStatus.FAILED },
    });
    return;
  }

  await prisma.post.update({
    where: { id: post.id },
    data: { status: PostStatus.PROCESSING },
  });

  let successCount = 0;
  let failedCount = 0;

  for (const target of post.targets) {
    const connection = post.user.socialConnections.find(
      (item) => item.platform === target.platform,
    );

    if (!connection) {
      failedCount += 1;

      await prisma.postTarget.update({
        where: { id: target.id },
        data: {
          status: PublicationStatus.FAILED,
          errorMessage: "No social connection found for this platform.",
        },
      });

      await prisma.publicationAttempt.create({
        data: {
          postId: post.id,
          targetId: target.id,
          platform: target.platform,
          status: PublicationStatus.FAILED,
          errorMessage: "No social connection found for this platform.",
        },
      });

      continue;
    }

    const result = await publishToPlatform({
      post,
      target,
      connection,
      media: post.media.map((item) => item.media),
    });

    const status = result.success ? PublicationStatus.SUCCESS : PublicationStatus.FAILED;

    await prisma.postTarget.update({
      where: { id: target.id },
      data: {
        status,
        externalPostId: result.externalPostId,
        errorMessage: result.error,
      },
    });

    await prisma.publicationAttempt.create({
      data: {
        postId: post.id,
        targetId: target.id,
        platform: target.platform,
        status,
        responseCode: result.responseCode,
        externalPostId: result.externalPostId,
        errorMessage: result.error,
      },
    });

    if (result.success) {
      successCount += 1;
    } else {
      failedCount += 1;
    }
  }

  if (successCount === post.targets.length) {
    await prisma.post.update({
      where: { id: post.id },
      data: {
        status: PostStatus.COMPLETED,
        publishedAt: new Date(),
      },
    });
    return;
  }

  if (successCount > 0 && failedCount > 0) {
    await prisma.post.update({
      where: { id: post.id },
      data: {
        status: PostStatus.PARTIAL_FAILED,
        publishedAt: new Date(),
      },
    });
    return;
  }

  await prisma.post.update({
    where: { id: post.id },
    data: {
      status: PostStatus.FAILED,
    },
  });
}

const worker = new Worker<PublicationJobData>(
  PUBLICATION_QUEUE_NAME,
  async (job) => {
    await processPublicationJob(job.data);
  },
  {
    connection: redisConnection,
    concurrency: 3,
  },
);

worker.on("ready", () => {
  console.log("SocialDeck publication worker is ready.");
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed.`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id ?? "unknown"} failed:`, error);
});

const shutdown = async () => {
  await worker.close();
  await prisma.$disconnect();
  await redisConnection.quit();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
