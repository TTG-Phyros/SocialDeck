import { Queue } from "bullmq";
import IORedis from "ioredis";

import { env } from "@/lib/env";

export const PUBLICATION_QUEUE_NAME = "publication-queue";

export type PublicationJobData = {
  postId: string;
};

const globalForQueue = globalThis as unknown as {
  redisConnection?: IORedis;
  publicationQueue?: Queue<PublicationJobData>;
};

export function getRedisConnection(): IORedis {
  if (!globalForQueue.redisConnection) {
    globalForQueue.redisConnection = new IORedis(env.redisUrl, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
  }

  return globalForQueue.redisConnection;
}

export function getPublicationQueue(): Queue<PublicationJobData> {
  if (!globalForQueue.publicationQueue) {
    globalForQueue.publicationQueue = new Queue<PublicationJobData>(
      PUBLICATION_QUEUE_NAME,
      {
        connection: getRedisConnection(),
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
          removeOnComplete: 200,
          removeOnFail: 500,
        },
      },
    );
  }

  return globalForQueue.publicationQueue;
}

export async function enqueuePublicationJob(postId: string, scheduledFor?: Date | null) {
  const delay = scheduledFor ? Math.max(scheduledFor.getTime() - Date.now(), 0) : 0;

  return getPublicationQueue().add("publish-post", { postId }, { delay });
}
