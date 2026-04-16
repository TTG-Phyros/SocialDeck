import { ZodError } from "zod";

import {
  createSessionToken,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { loginSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = loginSchema.parse(body);

    const email = payload.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return fail("Email ou mot de passe incorrect.", 401);
    }

    const validPassword = await verifyPassword(payload.password, user.passwordHash);

    if (!validPassword) {
      return fail("Email ou mot de passe incorrect.", 401);
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
    });

    await setSessionCookie(token);

    return ok({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssueMessage = error.issues[0]?.message;
      return fail(firstIssueMessage ?? "Requete invalide.", 400, error.flatten());
    }

    return fail("Erreur serveur lors de la connexion.", 500);
  }
}
