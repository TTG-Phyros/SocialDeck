import { OAuthStateStatus } from "@prisma/client";
import { addSeconds } from "date-fns";

import { prisma } from "@/lib/db";
import { exchangeAuthorizationCode, resolveRedirectUri } from "@/lib/oauth";
import { getOAuthProvider } from "@/lib/oauth-providers";
import { parsePlatformSlug } from "@/lib/social";

export const runtime = "nodejs";

function redirectToSettings(request: Request, query: Record<string, string>) {
  const destination = new URL("/settings", request.url);

  for (const [key, value] of Object.entries(query)) {
    destination.searchParams.set(key, value);
  }

  return Response.redirect(destination);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ platform: string }> },
) {
  const url = new URL(request.url);
  const { platform: platformSlug } = await context.params;
  const platform = parsePlatformSlug(platformSlug);

  if (!platform) {
    return redirectToSettings(request, {
      status: "error",
      message: "Unsupported platform.",
    });
  }

  const provider = getOAuthProvider(platform);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return redirectToSettings(request, {
      status: "error",
      message: oauthError,
      platform: platformSlug,
    });
  }

  if (!code || !state) {
    return redirectToSettings(request, {
      status: "error",
      message: "Missing OAuth code or state.",
      platform: platformSlug,
    });
  }

  const oauthState = await prisma.oAuthState.findUnique({
    where: { stateToken: state },
  });

  if (!oauthState || oauthState.platform !== platform || oauthState.status !== OAuthStateStatus.PENDING) {
    return redirectToSettings(request, {
      status: "error",
      message: "Invalid OAuth state.",
      platform: platformSlug,
    });
  }

  if (oauthState.expiresAt < new Date()) {
    await prisma.oAuthState.update({
      where: { id: oauthState.id },
      data: { status: OAuthStateStatus.EXPIRED },
    });

    return redirectToSettings(request, {
      status: "error",
      message: "OAuth session expired.",
      platform: platformSlug,
    });
  }

  try {
    const redirectUri = resolveRedirectUri(provider, url.origin, platformSlug);
    const token = await exchangeAuthorizationCode({
      provider,
      code,
      redirectUri,
      codeVerifier: oauthState.codeVerifier ?? undefined,
    });

    const expiresAt = token.expiresIn ? addSeconds(new Date(), token.expiresIn) : null;
    const externalAccountId =
      typeof token.raw.user_id === "string"
        ? token.raw.user_id
        : typeof token.raw.id === "string"
          ? token.raw.id
          : null;

    await prisma.$transaction([
      prisma.socialConnection.upsert({
        where: {
          userId_platform: {
            userId: oauthState.userId,
            platform,
          },
        },
        update: {
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          tokenType: token.tokenType,
          scope: token.scope,
          expiresAt,
          externalAccountId,
          username: externalAccountId,
        },
        create: {
          userId: oauthState.userId,
          platform,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          tokenType: token.tokenType,
          scope: token.scope,
          expiresAt,
          externalAccountId,
          username: externalAccountId,
        },
      }),
      prisma.oAuthState.update({
        where: { id: oauthState.id },
        data: { status: OAuthStateStatus.USED },
      }),
    ]);

    return redirectToSettings(request, {
      status: "connected",
      platform: platformSlug,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth token exchange failed.";

    return redirectToSettings(request, {
      status: "error",
      message,
      platform: platformSlug,
    });
  }
}
