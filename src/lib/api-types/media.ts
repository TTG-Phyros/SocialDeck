export type MediaAsset = {
  id: string;
  type: string;
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  createdAt: string;
};

export type MediaUploadResponse = {
  media: MediaAsset;
};