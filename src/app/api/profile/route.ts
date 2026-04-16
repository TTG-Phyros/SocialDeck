import { ZodError } from "zod";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { updateProfileSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return fail("Non autorise.", 401);
  }

  return ok({ user });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return fail("Non autorise.", 401);
  }

  try {
    const body = await request.json();
    const payload = updateProfileSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: payload.displayName?.trim(),
        avatarUrl: payload.avatarUrl ?? null,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return ok({ user: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return fail("Requete invalide.", 400, error.flatten());
    }

    return fail("Erreur serveur lors de la mise a jour du profil.", 500);
  }
}
