import Image from "next/image";

import { MediaDropzone } from "@/components/post/mediaDropzone";
import { Button, Card, SectionHeader, Text } from "@/components/ui";
import type { MediaAsset } from "@/lib/api-types";

import type { PendingFilePreview } from "../hooks/useMediaUpload";

type MediaUploadSectionProps = {
  selectedFiles: File[];
  pendingFilePreviews: PendingFilePreview[];
  uploadedMedia: MediaAsset[];
  uploading: boolean;
  onSelectedFilesChange: (files: File[]) => void;
  onRemovePendingFile: (file: File) => void;
  onRemoveUploadedMedia: (mediaId: string) => void;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kiloBytes = bytes / 1024;

  if (kiloBytes < 1024) {
    return `${kiloBytes.toFixed(1)} KB`;
  }

  const megaBytes = kiloBytes / 1024;
  return `${megaBytes.toFixed(1)} MB`;
}

export function MediaUploadSection({
  selectedFiles,
  pendingFilePreviews,
  uploadedMedia,
  uploading,
  onSelectedFilesChange,
  onRemovePendingFile,
  onRemoveUploadedMedia,
}: MediaUploadSectionProps) {
  return (
    <Card as="section">
      <SectionHeader
        title="1. Upload des medias"
        subtitle="Images et videos supportees (300MB max par fichier)."
      />

      <MediaDropzone
        files={selectedFiles}
        onFilesChange={onSelectedFilesChange}
        disabled={uploading}
      />

      {pendingFilePreviews.length ? (
        <ul className="token-list">
          {pendingFilePreviews.map((preview) => (
            <li key={preview.key} className="token-item">
              <div className="token-leading">
                {preview.isVideo ? (
                  <video
                    src={preview.previewUrl}
                    className="token-preview"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <Image
                    src={preview.previewUrl}
                    alt={preview.file.name}
                    width={72}
                    height={72}
                    className="token-preview"
                    unoptimized
                  />
                )}

                <div className="token-main">
                  <Text as="span">{preview.file.name}</Text>
                  <Text as="small">{formatFileSize(preview.file.size)}</Text>
                </div>
              </div>

              <Button
                variant="ghost"
                size="small"
                onClick={() => onRemovePendingFile(preview.file)}
                disabled={uploading}
              >
                Retirer
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {uploading ? <Text tone="info">Upload automatique en cours...</Text> : null}

      {uploadedMedia.length ? (
        <ul className="token-list">
          {uploadedMedia.map((item) => (
            <li key={item.id} className="token-item">
              <div className="token-main">
                <Text as="span">{item.originalName}</Text>
                <Text as="small">{item.type}</Text>
              </div>

              <Button
                variant="ghost"
                size="small"
                onClick={() => onRemoveUploadedMedia(item.id)}
              >
                Retirer
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
