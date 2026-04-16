import { Platform } from "@prisma/client";

export type OAuthProviderConfig = {
  platform: Platform;
  authorizeUrl: string;
  tokenUrl: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scopes: string[];
  usesPkce: boolean;
  extraAuthorizeParams?: Record<string, string>;
};

function readScopes(envName: string, fallback: string): string[] {
  const value = process.env[envName] ?? fallback;
  return value
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const providers: Record<Platform, OAuthProviderConfig> = {
  LINKEDIN: {
    platform: Platform.LINKEDIN,
    authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: process.env.LINKEDIN_REDIRECT_URI,
    scopes: readScopes("LINKEDIN_SCOPES", "openid profile w_member_social"),
    usesPkce: true,
  },
  INSTAGRAM: {
    platform: Platform.INSTAGRAM,
    authorizeUrl: "https://www.facebook.com/v23.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v23.0/oauth/access_token",
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI,
    scopes: readScopes("INSTAGRAM_SCOPES", "instagram_basic instagram_content_publish"),
    usesPkce: true,
  },
  FACEBOOK: {
    platform: Platform.FACEBOOK,
    authorizeUrl: "https://www.facebook.com/v23.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v23.0/oauth/access_token",
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    redirectUri: process.env.FACEBOOK_REDIRECT_URI,
    scopes: readScopes(
      "FACEBOOK_SCOPES",
      "pages_manage_posts pages_read_engagement instagram_basic instagram_content_publish",
    ),
    usesPkce: true,
  },
  THREADS: {
    platform: Platform.THREADS,
    authorizeUrl: "https://threads.net/oauth/authorize",
    tokenUrl: "https://graph.threads.net/oauth/access_token",
    clientId: process.env.THREADS_CLIENT_ID,
    clientSecret: process.env.THREADS_CLIENT_SECRET,
    redirectUri: process.env.THREADS_REDIRECT_URI,
    scopes: readScopes("THREADS_SCOPES", "threads_basic threads_content_publish"),
    usesPkce: true,
  },
  PINTEREST: {
    platform: Platform.PINTEREST,
    authorizeUrl: "https://www.pinterest.com/oauth/",
    tokenUrl: "https://api.pinterest.com/v5/oauth/token",
    clientId: process.env.PINTEREST_CLIENT_ID,
    clientSecret: process.env.PINTEREST_CLIENT_SECRET,
    redirectUri: process.env.PINTEREST_REDIRECT_URI,
    scopes: readScopes("PINTEREST_SCOPES", "pins:read pins:write boards:read"),
    usesPkce: true,
  },
  YOUTUBE: {
    platform: Platform.YOUTUBE,
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    redirectUri: process.env.YOUTUBE_REDIRECT_URI,
    scopes: readScopes("YOUTUBE_SCOPES", "https://www.googleapis.com/auth/youtube.upload"),
    usesPkce: true,
    extraAuthorizeParams: {
      access_type: "offline",
      prompt: "consent",
    },
  },
  GOOGLE_BUSINESS: {
    platform: Platform.GOOGLE_BUSINESS,
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: process.env.GOOGLE_BUSINESS_CLIENT_ID,
    clientSecret: process.env.GOOGLE_BUSINESS_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_BUSINESS_REDIRECT_URI,
    scopes: readScopes("GOOGLE_BUSINESS_SCOPES", "https://www.googleapis.com/auth/business.manage"),
    usesPkce: true,
    extraAuthorizeParams: {
      access_type: "offline",
      prompt: "consent",
    },
  },
};

export function getOAuthProvider(platform: Platform): OAuthProviderConfig {
  return providers[platform];
}

export function isOAuthProviderConfigured(provider: OAuthProviderConfig): boolean {
  return Boolean(provider.clientId && provider.clientSecret);
}
