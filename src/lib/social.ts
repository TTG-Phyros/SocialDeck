import { Platform } from "@prisma/client";

export const platformLabels: Record<Platform, string> = {
  LINKEDIN: "LinkedIn",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  THREADS: "Threads",
  PINTEREST: "Pinterest",
  YOUTUBE: "YouTube",
  GOOGLE_BUSINESS: "Google Business",
};

export const platformSlugs: Record<Platform, string> = {
  LINKEDIN: "linkedin",
  INSTAGRAM: "instagram",
  FACEBOOK: "facebook",
  THREADS: "threads",
  PINTEREST: "pinterest",
  YOUTUBE: "youtube",
  GOOGLE_BUSINESS: "google-business",
};

const slugToPlatform = Object.entries(platformSlugs).reduce(
  (accumulator, [platform, slug]) => {
    accumulator[slug] = platform as Platform;
    return accumulator;
  },
  {} as Record<string, Platform>,
);

export const supportedPlatforms = Object.values(Platform) as Platform[];

export function parsePlatformSlug(slug: string): Platform | null {
  return slugToPlatform[slug.toLowerCase()] ?? null;
}

export function parsePlatformValue(value: string): Platform | null {
  const upperValue = value.toUpperCase();

  if ((supportedPlatforms as string[]).includes(upperValue)) {
    return upperValue as Platform;
  }

  return parsePlatformSlug(value);
}
