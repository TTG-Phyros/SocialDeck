import { ZodError } from "zod";

import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { registerSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = registerSchema.parse(body);

    const email = payload.email.trim().toLowerCase();
    const displayName = payload.displayName.trim();

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return fail("Un compte existe deja avec cet email.", 409);
    }

    const passwordHash = await hashPassword(payload.password);

    const user = await prisma.user.create({
      data: {
        email,
        displayName,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
    });

    await setSessionCookie(token);

    return ok({ user }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssueMessage = error.issues[0]?.message;
      return fail(firstIssueMessage ?? "Requete invalide.", 400, error.flatten());
    }

    return fail("Erreur serveur lors de l'inscription.", 500);
  }
}
