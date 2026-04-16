import { Platform } from "@prisma/client";
import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'email est requis." })
    .email({ message: "Adresse email invalide." })
    .max(191, { message: "L'email est trop long." }),
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caracteres." })
    .max(72, { message: "Le mot de passe est trop long." }),
  displayName: z
    .string()
    .min(2, { message: "Le nom affiche doit contenir au moins 2 caracteres." })
    .max(120, { message: "Le nom affiche est trop long." }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'email est requis." })
    .email({ message: "Adresse email invalide." })
    .max(191, { message: "L'email est trop long." }),
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caracteres." })
    .max(72, { message: "Le mot de passe est trop long." }),
});

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "Le nom affiche doit contenir au moins 2 caracteres." })
    .max(120, { message: "Le nom affiche est trop long." })
    .optional(),
  avatarUrl: z
    .string()
    .url({ message: "L'URL d'avatar est invalide." })
    .max(512, { message: "L'URL d'avatar est trop longue." })
    .nullable()
    .optional(),
});

export const deleteConnectionSchema = z.object({
  platform: z
    .string()
    .min(2, { message: "La plateforme est requise." }),
});

export const createPostTargetSchema = z.object({
  platform: z.nativeEnum(Platform),
  customTitle: z
    .string()
    .trim()
    .min(1, { message: "Le titre est obligatoire pour chaque plateforme." })
    .max(280, { message: "Le titre specifique est trop long (280 caracteres max)." }),
  customDescription: z
    .string()
    .trim()
    .min(1, { message: "La description est obligatoire pour chaque plateforme." })
    .max(4000, { message: "La description specifique est trop longue (4000 caracteres max)." }),
});

export const createPostSchema = z.object({
  mediaIds: z
    .array(z.string().cuid({ message: "Un media selectionne est invalide." }))
    .min(1, { message: "Ajoute au moins un media." })
    .max(10, { message: "Tu peux ajouter au maximum 10 medias." }),
  targets: z
    .array(createPostTargetSchema)
    .min(1, { message: "Selectionne au moins une plateforme." }),
  scheduledFor: z
    .string()
    .datetime({ message: "La date de planification est invalide." })
    .nullish(),
});
