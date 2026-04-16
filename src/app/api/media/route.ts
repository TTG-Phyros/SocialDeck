import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { MediaType } from "@prisma/client";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";

const MAX_UPLOAD_SIZE = 1024 * 1024 * 300;

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return fail("Non autorise.", 401);
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return fail("Un fichier media est requis.", 400);
  }

  if (!(file instanceof File)) {
    return fail("Fichier invalide.", 400);
  }

  const isSupportedType = file.type.startsWith("image/") || file.type.startsWith("video/");

  if (!isSupportedType) {
    return fail("Seules les images et videos sont acceptees.", 400);
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return fail("Fichier trop volumineux. Taille maximale: 300MB.", 413);
  }

  const mediaType = file.type.startsWith("video/") ? MediaType.VIDEO : MediaType.IMAGE;
  const originalName = path.basename(file.name || `upload-${Date.now()}`);
  const extension = path.extname(originalName) || (mediaType === MediaType.IMAGE ? ".jpg" : ".mp4");
  const filename = `${Date.now()}-${randomUUID()}${extension.toLowerCase()}`;

  const uploadDirectory = path.isAbsolute(env.uploadDir)
    ? env.uploadDir
    : path.join(/*turbopackIgnore: true*/ process.cwd(), env.uploadDir);

  await mkdir(uploadDirectory, { recursive: true });

  const absoluteStoragePath = path.join(uploadDirectory, filename);
  const relativeStoragePath = path.posix.join("uploads", filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absoluteStoragePath, buffer);

  const mediaAsset = await prisma.mediaAsset.create({
    data: {
      userId: user.id,
      type: mediaType,
      originalName,
      mimeType: file.type,
      filename,
      size: file.size,
      storagePath: relativeStoragePath,
    },
    select: {
      id: true,
      type: true,
      originalName: true,
      mimeType: true,
      size: true,
      storagePath: true,
      createdAt: true,
    },
  });

  return ok({ media: mediaAsset }, 201);
}
