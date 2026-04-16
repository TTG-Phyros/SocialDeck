"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/lib/api-client";
import type { MediaAsset, MediaUploadResponse } from "@/lib/api-types";

export type PendingFilePreview = {
  key: string;
  file: File;
  previewUrl: string;
  isVideo: boolean;
};

type UseMediaUploadOptions = {
  hasConnectedPlatforms: boolean;
  setError: (message: string | null) => void;
};

function buildFileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function useMediaUpload({ hasConnectedPlatforms, setError }: UseMediaUploadOptions) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<MediaAsset[]>([]);
  const [uploading, setUploading] = useState(false);

  const pendingFilePreviews = useMemo<PendingFilePreview[]>(
    () =>
      selectedFiles.map((file) => ({
        key: buildFileKey(file),
        file,
        previewUrl: URL.createObjectURL(file),
        isVideo: file.type.startsWith("video/"),
      })),
    [selectedFiles],
  );

  useEffect(() => {
    return () => {
      pendingFilePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.previewUrl);
      });
    };
  }, [pendingFilePreviews]);

  const uploadMedia = useCallback(
    async (files: File[]) => {
      if (!hasConnectedPlatforms) {
        setError("Connecte d'abord un compte social pour activer l'upload des medias.");
        return;
      }

      if (!files.length) {
        setError("Selectionne au moins un fichier a uploader.");
        return;
      }

      setUploading(true);
      setError(null);

      try {
        const uploaded: MediaAsset[] = [];

        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);

          const data = await apiFetch<MediaUploadResponse>("/api/media", {
            method: "POST",
            body: formData,
          });
          uploaded.push(data.media);
        }

        setUploadedMedia((current) => [...current, ...uploaded]);
        setSelectedFiles([]);
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Echec de l'upload.");
      } finally {
        setUploading(false);
      }
    },
    [hasConnectedPlatforms, setError],
  );

  const handleSelectedFilesChange = useCallback(
    (files: File[]) => {
      setSelectedFiles(files);

      if (files.length && !uploading) {
        void uploadMedia(files);
      }
    },
    [uploading, uploadMedia],
  );

  const removePendingFile = useCallback((fileToRemove: File) => {
    const keyToRemove = buildFileKey(fileToRemove);
    setSelectedFiles((current) => current.filter((file) => buildFileKey(file) !== keyToRemove));
  }, []);

  const removeUploadedMedia = useCallback((mediaId: string) => {
    setUploadedMedia((current) => current.filter((item) => item.id !== mediaId));
  }, []);

  const clearUploadedMedia = useCallback(() => {
    setUploadedMedia([]);
  }, []);

  return {
    selectedFiles,
    uploadedMedia,
    uploading,
    pendingFilePreviews,
    handleSelectedFilesChange,
    removePendingFile,
    removeUploadedMedia,
    clearUploadedMedia,
  };
}
