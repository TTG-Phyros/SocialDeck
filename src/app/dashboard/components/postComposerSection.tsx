import type { FormEvent } from "react";

import { PlatformContentFields } from "@/components/post/platformContentFields";
import { Button, Card, Checkbox, FormField, Input, SectionHeader, Text } from "@/components/ui";
import type { SocialConnection } from "@/lib/api-types";

import type { PlatformOverrides } from "../types";

type PostComposerSectionProps = {
  connectedPlatforms: SocialConnection[];
  selectedPlatforms: string[];
  platformOverrides: PlatformOverrides;
  scheduledFor: string;
  error: string | null;
  submitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onScheduledForChange: (value: string) => void;
  onTogglePlatform: (platform: string) => void;
  onUpdatePlatformOverride: (
    platform: string,
    field: "customTitle" | "customDescription",
    value: string,
  ) => void;
  getPlatformLabel: (platform: string) => string;
};

export function PostComposerSection({
  connectedPlatforms,
  selectedPlatforms,
  platformOverrides,
  scheduledFor,
  error,
  submitting,
  onSubmit,
  onScheduledForChange,
  onTogglePlatform,
  onUpdatePlatformOverride,
  getPlatformLabel,
}: PostComposerSectionProps) {
  return (
    <Card as="section">
      <SectionHeader title="2. Composer et publier" />

      <form className="post-form" onSubmit={onSubmit}>
        <FormField label="Planifier (optionnel)" htmlFor="post-schedule">
          <Input
            id="post-schedule"
            type="datetime-local"
            value={scheduledFor}
            onChange={(event) => onScheduledForChange(event.target.value)}
          />
        </FormField>

        <FormField label="Plateformes cibles">
          {connectedPlatforms.length ? (
            <div className="platform-grid">
              {connectedPlatforms.map((platform) => (
                <label key={platform.platform} className="platform-checkbox">
                  <Checkbox
                    checked={selectedPlatforms.includes(platform.platform)}
                    onChange={() => onTogglePlatform(platform.platform)}
                  />
                  <Text as="span">{platform.label}</Text>
                </label>
              ))}
            </div>
          ) : (
            <Text tone="muted" as="p">
              Connecte au moins un compte social dans Parametres pour publier.
            </Text>
          )}
        </FormField>

        {selectedPlatforms.length ? (
          selectedPlatforms.map((platform) => (
            <PlatformContentFields
              key={platform}
              platformKey={platform}
              platformLabel={getPlatformLabel(platform)}
              titleValue={platformOverrides[platform]?.customTitle ?? ""}
              descriptionValue={platformOverrides[platform]?.customDescription ?? ""}
              onTitleChange={(value) => onUpdatePlatformOverride(platform, "customTitle", value)}
              onDescriptionChange={(value) =>
                onUpdatePlatformOverride(platform, "customDescription", value)
              }
            />
          ))
        ) : (
          <Text tone="muted" as="p">
            Selectionne une plateforme pour saisir son titre et sa description dedies.
          </Text>
        )}

        {error ? <Text tone="error">{error}</Text> : null}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Publication..." : "Creer la publication"}
        </Button>
      </form>
    </Card>
  );
}
