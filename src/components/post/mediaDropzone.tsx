"use client";

import { type DragEvent, useRef, useState } from "react";

import { Button, Text } from "@/components/ui";
import { cn } from "@/lib/cn";

type MediaDropzoneProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
};

function fileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function MediaDropzone({ files, onFilesChange, disabled = false }: MediaDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const mergeFiles = (incoming: FileList | File[]) => {
    const incomingFiles = Array.from(incoming);

    if (!incomingFiles.length) {
      return;
    }

    const unique = new Map(files.map((file) => [fileKey(file), file]));

    for (const file of incomingFiles) {
      unique.set(fileKey(file), file);
    }

    onFilesChange(Array.from(unique.values()));
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    mergeFiles(event.dataTransfer.files);
  };

  const openSystemFilePicker = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="dropzone-wrapper">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={(event) => {
          mergeFiles(event.currentTarget.files ?? []);
          event.currentTarget.value = "";
        }}
        className="dropzone-native-input"
      />

      <div
        className={cn(
          "media-dropzone",
          isDragging ? "is-drag-active" : undefined,
          disabled ? "is-disabled" : undefined,
        )}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={openSystemFilePicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openSystemFilePicker();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Text as="p" className="dropzone-title">
          Glisse-depose tes fichiers ici
        </Text>
        <Text as="p" className="dropzone-subtitle">
          ou clique pour parcourir les fichiers de ta machine
        </Text>
        <Text tone="mini" as="p">
          {files.length
            ? `${files.length} fichier(s) selectionne(s)`
            : "Formats supportes: images et videos (300MB max par fichier)."}
        </Text>
      </div>

      {files.length ? (
        <div className="dropzone-actions">
          <Button
            variant="ghost"
            size="small"
            onClick={() => onFilesChange([])}
            disabled={disabled}
          >
            Vider la selection
          </Button>
        </div>
      ) : null}
    </div>
  );
}
