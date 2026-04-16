import type { MediaAsset } from "./media";

export type PostCreateResult = {
  id: string;
  status: string;
  scheduledFor: string | null;
  createdAt: string;
};

export type PostCreateResponse = {
  post: PostCreateResult;
};

export type PostHistoryTarget = {
  id: string;
  platform: string;
  customTitle: string | null;
  customDescription: string | null;
  status: string;
  externalPostId: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PostHistoryAttempt = {
  id: string;
  postId: string;
  targetId: string | null;
  platform: string;
  status: string;
  responseCode: number | null;
  externalPostId: string | null;
  errorMessage: string | null;
  attemptedAt: string;
};

export type PostHistoryItem = {
  id: string;
  title: string | null;
  description: string | null;
  status: string;
  scheduledFor: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  targets: PostHistoryTarget[];
  media: MediaAsset[];
  attempts: PostHistoryAttempt[];
};

export type PostHistoryResponse = {
  history: PostHistoryItem[];
};