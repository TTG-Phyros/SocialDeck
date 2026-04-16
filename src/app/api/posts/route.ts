import { PostStatus } from "@prisma/client";
import { ZodError } from "zod";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { enqueuePublicationJob } from "@/lib/queue";
import { createPostSchema } from "@/lib/validators";

export const runtime = "nodejs";

function normalizeNullable(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return fail("Non autorise.", 401);
  }

  try {
    const body = await request.json();
    const payload = createPostSchema.parse(body);

    const mediaIds = [...new Set(payload.mediaIds)];

    if (mediaIds.length !== payload.mediaIds.length) {
      return fail("Chaque media doit etre unique.", 400);
    }

    const targetPlatforms = payload.targets.map((target) => target.platform);
    const uniquePlatforms = [...new Set(targetPlatforms)];

    if (uniquePlatforms.length !== targetPlatforms.length) {
      return fail("Chaque plateforme ne peut etre selectionnee qu'une seule fois.", 400);
    }

    const mediaAssets = await prisma.mediaAsset.findMany({
      where: {
        id: { in: mediaIds },
        userId: user.id,
      },
      select: { id: true },
    });

    if (mediaAssets.length !== mediaIds.length) {
      return fail("Certains medias sont introuvables ou ne t'appartiennent pas.", 400);
    }

    const socialConnections = await prisma.socialConnection.findMany({
      where: {
        userId: user.id,
        platform: { in: uniquePlatforms },
      },
      select: { platform: true },
    });

    if (socialConnections.length !== uniquePlatforms.length) {
      const missing = uniquePlatforms.filter(
        (platform) => !socialConnections.some((item) => item.platform === platform),
      );

      return fail("Connexion sociale manquante pour une ou plusieurs plateformes.", 400, {
        missingPlatforms: missing,
      });
    }

    const scheduledFor = payload.scheduledFor ? new Date(payload.scheduledFor) : null;

    if (scheduledFor && Number.isNaN(scheduledFor.getTime())) {
      return fail("Date de planification invalide.", 400);
    }

    const postStatus =
      scheduledFor && scheduledFor.getTime() > Date.now() ? PostStatus.SCHEDULED : PostStatus.QUEUED;

    const post = await prisma.$transaction(async (transaction) => {
      const created = await transaction.post.create({
        data: {
          userId: user.id,
          title: null,
          description: null,
          scheduledFor,
          status: postStatus,
        },
        select: {
          id: true,
          status: true,
          scheduledFor: true,
          createdAt: true,
        },
      });

      await transaction.postMedia.createMany({
        data: mediaIds.map((mediaId, index) => ({
          postId: created.id,
          mediaId,
          position: index,
        })),
      });

      await transaction.postTarget.createMany({
        data: payload.targets.map((target) => ({
          postId: created.id,
          platform: target.platform,
          customTitle: normalizeNullable(target.customTitle),
          customDescription: normalizeNullable(target.customDescription),
        })),
      });

      return created;
    });

    try {
      await enqueuePublicationJob(post.id, scheduledFor);
    } catch {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: PostStatus.FAILED,
        },
      });

      return fail(
        "Publication creee mais impossible a placer dans la file. Verifie Redis et le worker.",
        503,
      );
    }

    return ok(
      {
        post,
      },
      201,
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssueMessage = error.issues[0]?.message;
      return fail(firstIssueMessage ?? "Requete invalide.", 400, error.flatten());
    }

    return fail("Erreur serveur lors de la creation de la publication.", 500);
  }
}
