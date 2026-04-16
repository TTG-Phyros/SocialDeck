import { ZodError } from "zod";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { platformLabels, platformSlugs, parsePlatformValue, supportedPlatforms } from "@/lib/social";
import { deleteConnectionSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return fail("Non autorise.", 401);
  }

  const connectedAccounts = await prisma.socialConnection.findMany({
    where: { userId: user.id },
    select: {
      platform: true,
      username: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const byPlatform = new Map(connectedAccounts.map((item) => [item.platform, item]));

  const connections = supportedPlatforms.map((platform) => {
    const current = byPlatform.get(platform);

    return {
      platform,
      slug: platformSlugs[platform],
      label: platformLabels[platform],
      connected: Boolean(current),
      username: current?.username ?? null,
      expiresAt: current?.expiresAt ?? null,
      connectedAt: current?.createdAt ?? null,
      updatedAt: current?.updatedAt ?? null,
    };
  });

  return ok({ connections });
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return fail("Non autorise.", 401);
  }

  try {
    const body = await request.json();
    const payload = deleteConnectionSchema.parse(body);
    const platform = parsePlatformValue(payload.platform);

    if (!platform) {
      return fail("Plateforme non prise en charge.", 400);
    }

    await prisma.socialConnection.deleteMany({
      where: {
        userId: user.id,
        platform,
      },
    });

    return ok({ disconnected: true, platform });
  } catch (error) {
    if (error instanceof ZodError) {
      return fail("Requete invalide.", 400, error.flatten());
    }

    return fail("Erreur serveur lors de la deconnexion du compte social.", 500);
  }
}
