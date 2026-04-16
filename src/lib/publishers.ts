import {
  type MediaAsset,
  Platform,
  type Post,
  type PostTarget,
  type SocialConnection,
} from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export type PublishResult = {
  success: boolean;
  externalPostId?: string;
  error?: string;
  responseCode?: number;
};

type PublishInput = {
  post: Pick<Post, "id" | "title" | "description">;
  target: Pick<PostTarget, "platform" | "customTitle" | "customDescription">;
  connection: Pick<SocialConnection, "platform" | "accessToken" | "refreshToken">;
  media: Array<Pick<MediaAsset, "id" | "mimeType" | "storagePath">>;
};

const unofficialPublishEndpoints: Partial<Record<Platform, string>> = {
  LINKEDIN: "https://api.linkedin.com/v2/ugcPosts",
  FACEBOOK: "https://graph.facebook.com/v23.0/me/feed",
  INSTAGRAM: "https://graph.facebook.com/v23.0/me/media",
  THREADS: "https://graph.threads.net/v1.0/me/threads",
  PINTEREST: "https://api.pinterest.com/v5/pins",
  YOUTUBE: "https://www.googleapis.com/upload/youtube/v3/videos",
  GOOGLE_BUSINESS: "https://mybusinessbusinessinformation.googleapis.com/v1/accounts",
};

function resolveTitle(post: Pick<Post, "title">, target: Pick<PostTarget, "customTitle">): string {
  return target.customTitle?.trim() || post.title?.trim() || "Untitled SocialDeck publication";
}

function resolveDescription(
  post: Pick<Post, "description">,
  target: Pick<PostTarget, "customDescription">,
): string {
  return target.customDescription?.trim() || post.description?.trim() || "";
}

export async function publishToPlatform(input: PublishInput): Promise<PublishResult> {
  const { post, target, connection, media } = input;

  if (!connection.accessToken) {
    return {
      success: false,
      error: "Access token missing for this social connection.",
    };
  }

  const endpoint = unofficialPublishEndpoints[target.platform];

  if (!endpoint) {
    return {
      success: false,
      error: `Unsupported platform: ${target.platform}`,
    };
  }

  const payload = {
    title: resolveTitle(post, target),
    description: resolveDescription(post, target),
    media: media.map((item) => ({
      id: item.id,
      mimeType: item.mimeType,
      path: item.storagePath,
    })),
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${connection.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
  let parsed: Record<string, unknown> | null = null;

  try {
    parsed = JSON.parse(rawText) as Record<string, unknown>;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    return {
      success: false,
      responseCode: response.status,
      error:
        (parsed?.error as string | undefined) ||
        (parsed?.message as string | undefined) ||
        rawText ||
        `Publish failed with status ${response.status}`,
    };
  }

  const externalPostId =
    (parsed?.id as string | undefined) ||
    (parsed?.postId as string | undefined) ||
    `${target.platform.toLowerCase()}_${uuidv4()}`;

  return {
    success: true,
    responseCode: response.status,
    externalPostId,
  };
}
