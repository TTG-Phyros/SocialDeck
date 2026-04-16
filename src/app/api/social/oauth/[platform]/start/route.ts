import { addMinutes } from "date-fns";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fail } from "@/lib/http";
import {
  buildAuthorizationUrl,
  createCodeChallenge,
  createCodeVerifier,
  createStateToken,
  resolveRedirectUri,
} from "@/lib/oauth";
import {
  getOAuthProvider,
  isOAuthProviderConfigured,
} from "@/lib/oauth-providers";
import { parsePlatformSlug } from "@/lib/social";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ platform: string }> },
) {
  const user = await getSessionUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    return Response.redirect(loginUrl);
  }

  const { platform: platformSlug } = await context.params;
  const platform = parsePlatformSlug(platformSlug);

  if (!platform) {
    return fail("Plateforme non prise en charge.", 400);
  }

  const provider = getOAuthProvider(platform);

  if (!isOAuthProviderConfigured(provider)) {
    return fail(
      `Provider OAuth non configure pour ${platform}. Ajoute les identifiants dans .env.`,
      400,
    );
  }

  const stateToken = createStateToken();
  const codeVerifier = createCodeVerifier();
  const codeChallenge = createCodeChallenge(codeVerifier);
  const requestOrigin = new URL(request.url).origin;
  const redirectUri = resolveRedirectUri(provider, requestOrigin, platformSlug);

  await prisma.oAuthState.create({
    data: {
      userId: user.id,
      platform,
      stateToken,
      codeVerifier,
      redirectUri,
      expiresAt: addMinutes(new Date(), 10),
    },
  });

  const authorizationUrl = buildAuthorizationUrl({
    provider,
    stateToken,
    redirectUri,
    codeChallenge,
  });

  return Response.redirect(authorizationUrl);
}
