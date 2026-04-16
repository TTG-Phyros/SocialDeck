import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return fail("Non autorise.", 401);
  }

  const url = new URL(request.url);
  const limitValue = Number(url.searchParams.get("limit") ?? 20);
  const limit = Number.isFinite(limitValue) ? Math.min(Math.max(limitValue, 1), 100) : 20;

  const posts = await prisma.post.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    include: {
      targets: {
        orderBy: {
          createdAt: "asc",
        },
      },
      media: {
        include: {
          media: true,
        },
        orderBy: {
          position: "asc",
        },
      },
      attempts: {
        orderBy: {
          attemptedAt: "desc",
        },
        take: 30,
      },
    },
  });

  const history = posts.map((post) => ({
    id: post.id,
    title: post.title,
    description: post.description,
    status: post.status,
    scheduledFor: post.scheduledFor,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    targets: post.targets,
    media: post.media.map((item) => item.media),
    attempts: post.attempts,
  }));

  return ok({ history });
}
