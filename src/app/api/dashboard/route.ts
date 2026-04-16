import { PostStatus } from "@prisma/client";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return fail("Non autorise.", 401);
  }

  const [totalPosts, scheduledPosts, completedPosts, failedPosts, connectedPlatforms, recentAttempts] =
    await Promise.all([
      prisma.post.count({ where: { userId: user.id } }),
      prisma.post.count({
        where: {
          userId: user.id,
          status: PostStatus.SCHEDULED,
        },
      }),
      prisma.post.count({
        where: {
          userId: user.id,
          status: PostStatus.COMPLETED,
        },
      }),
      prisma.post.count({
        where: {
          userId: user.id,
          status: {
            in: [PostStatus.FAILED, PostStatus.PARTIAL_FAILED],
          },
        },
      }),
      prisma.socialConnection.count({ where: { userId: user.id } }),
      prisma.publicationAttempt.findMany({
        where: {
          post: {
            userId: user.id,
          },
        },
        orderBy: {
          attemptedAt: "desc",
        },
        take: 10,
        select: {
          id: true,
          platform: true,
          status: true,
          errorMessage: true,
          attemptedAt: true,
          postId: true,
        },
      }),
    ]);

  return ok({
    metrics: {
      totalPosts,
      scheduledPosts,
      completedPosts,
      failedPosts,
      connectedPlatforms,
    },
    recentAttempts,
  });
}
