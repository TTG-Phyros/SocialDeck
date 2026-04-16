import { createHash, randomBytes, randomUUID } from "crypto";

import type { OAuthProviderConfig } from "@/lib/oauth-providers";

export type OAuthTokenResponse = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  scope?: string;
  tokenType?: string;
  raw: Record<string, unknown>;
};

export function createStateToken(): string {
  return randomUUID();
}

export function createCodeVerifier(): string {
  return randomBytes(48).toString("base64url");
}

export function createCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function resolveRedirectUri(
  provider: OAuthProviderConfig,
  requestOrigin: string,
  platformSlug: string,
): string {
  return provider.redirectUri ?? `${requestOrigin}/api/social/oauth/${platformSlug}/callback`;
}

export function buildAuthorizationUrl(options: {
  provider: OAuthProviderConfig;
  stateToken: string;
  redirectUri: string;
  codeChallenge?: string;
}): string {
  const { provider, stateToken, redirectUri, codeChallenge } = options;

  if (!provider.clientId) {
    throw new Error(`Client id missing for ${provider.platform}.`);
  }

  const params = new URLSearchParams({
    client_id: provider.clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    state: stateToken,
    scope: provider.scopes.join(" "),
  });

  if (provider.usesPkce && codeChallenge) {
    params.set("code_challenge", codeChallenge);
    params.set("code_challenge_method", "S256");
  }

  if (provider.extraAuthorizeParams) {
    for (const [key, value] of Object.entries(provider.extraAuthorizeParams)) {
      params.set(key, value);
    }
  }

  return `${provider.authorizeUrl}?${params.toString()}`;
}

export async function exchangeAuthorizationCode(options: {
  provider: OAuthProviderConfig;
  code: string;
  redirectUri: string;
  codeVerifier?: string;
}): Promise<OAuthTokenResponse> {
  const { provider, code, redirectUri, codeVerifier } = options;

  if (!provider.clientId || !provider.clientSecret) {
    throw new Error(`OAuth credentials missing for ${provider.platform}.`);
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: provider.clientId,
    client_secret: provider.clientSecret,
  });

  if (provider.usesPkce && codeVerifier) {
    body.set("code_verifier", codeVerifier);
  }

  const response = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const rawText = await response.text();
  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(rawText) as Record<string, unknown>;
  } catch {
    throw new Error(`Invalid token response from ${provider.platform}: ${rawText}`);
  }

  if (!response.ok) {
    const errorMessage =
      (parsed.error_description as string | undefined) ??
      (parsed.error as string | undefined) ??
      `Token exchange failed with status ${response.status}`;

    throw new Error(`${provider.platform}: ${errorMessage}`);
  }

  const accessToken = parsed.access_token;

  if (!accessToken || typeof accessToken !== "string") {
    throw new Error(`Token exchange failed for ${provider.platform}: access_token missing.`);
  }

  return {
    accessToken,
    refreshToken:
      typeof parsed.refresh_token === "string" ? parsed.refresh_token : undefined,
    expiresIn: typeof parsed.expires_in === "number" ? parsed.expires_in : undefined,
    scope: typeof parsed.scope === "string" ? parsed.scope : undefined,
    tokenType: typeof parsed.token_type === "string" ? parsed.token_type : undefined,
    raw: parsed,
  };
}
