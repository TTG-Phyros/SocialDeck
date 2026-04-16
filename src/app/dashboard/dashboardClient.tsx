"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { MediaUploadSection } from "@/app/dashboard/components/mediaUploadSection";
import { PostComposerSection } from "@/app/dashboard/components/postComposerSection";
import { PublicationHistorySection } from "@/app/dashboard/components/publicationHistorySection";
import { useMediaUpload } from "@/app/dashboard/hooks/useMediaUpload";
import type { PlatformOverrides } from "@/app/dashboard/types";
import {
  ButtonLink,
  Card,
  MetricCard,
  SectionHeader,
  Text,
} from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import type {
  DashboardMetrics,
  DashboardResponse,
  PostCreateResponse,
  PostHistoryItem,
  PostHistoryResponse,
  SocialConnection,
  SocialConnectionsResponse,
} from "@/lib/api-types";

export function DashboardClient({ userName }: { userName: string }) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [history, setHistory] = useState<PostHistoryItem[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [platformOverrides, setPlatformOverrides] = useState<PlatformOverrides>({});
  const [scheduledFor, setScheduledFor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const metricItems = [
    { label: "Total posts", value: metrics?.totalPosts ?? 0 },
    { label: "Planifies", value: metrics?.scheduledPosts ?? 0 },
    { label: "Reussis", value: metrics?.completedPosts ?? 0 },
    { label: "Echecs", value: metrics?.failedPosts ?? 0 },
    { label: "Comptes connectes", value: metrics?.connectedPlatforms ?? 0 },
  ];

  const connectedPlatforms = useMemo(
    () => connections.filter((platform) => platform.connected),
    [connections],
  );

  const hasConnectedPlatforms = connectedPlatforms.length > 0;

  const {
    selectedFiles,
    uploadedMedia,
    uploading,
    pendingFilePreviews,
    handleSelectedFilesChange,
    removePendingFile,
    removeUploadedMedia,
    clearUploadedMedia,
  } = useMediaUpload({ hasConnectedPlatforms, setError });

  const platformLabels = useMemo(
    () =>
      connections.reduce<Record<string, string>>((current, connection) => {
        current[connection.platform] = connection.label;
        return current;
      }, {}),
    [connections],
  );

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [dashboardData, connectionsData, historyData] = await Promise.all([
        apiFetch<DashboardResponse>("/api/dashboard"),
        apiFetch<SocialConnectionsResponse>("/api/social/connections"),
        apiFetch<PostHistoryResponse>("/api/posts/history?limit=30"),
      ]);

      setMetrics(dashboardData.metrics);
      setConnections(connectionsData.connections);
      setHistory(historyData.history);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de charger les donnees du dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((current) => {
      const isSelected = current.includes(platform);

      setPlatformOverrides((existingOverrides) => {
        if (isSelected) {
          const remaining = { ...existingOverrides };
          delete remaining[platform];
          return remaining;
        }

        return {
          ...existingOverrides,
          [platform]: existingOverrides[platform] ?? {
            customTitle: "",
            customDescription: "",
          },
        };
      });

      return isSelected
        ? current.filter((item) => item !== platform)
        : [...current, platform];
    });
  };

  const updatePlatformOverride = (
    platform: string,
    field: "customTitle" | "customDescription",
    value: string,
  ) => {
    setPlatformOverrides((current) => ({
      ...current,
      [platform]: {
        customTitle: current[platform]?.customTitle ?? "",
        customDescription: current[platform]?.customDescription ?? "",
        [field]: value,
      },
    }));
  };

  const getPlatformLabel = (platform: string): string => platformLabels[platform] ?? platform;

  const submitPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!uploadedMedia.length) {
      setError("Ajoute au moins un media avant de publier.");
      return;
    }

    if (!selectedPlatforms.length) {
      setError("Selectionne au moins une plateforme cible.");
      return;
    }

    for (const platform of selectedPlatforms) {
      const customTitle = platformOverrides[platform]?.customTitle.trim();
      const customDescription = platformOverrides[platform]?.customDescription.trim();

      if (!customTitle) {
        setError(`Renseigne un titre pour ${getPlatformLabel(platform)}.`);
        return;
      }

      if (!customDescription) {
        setError(`Renseigne une description pour ${getPlatformLabel(platform)}.`);
        return;
      }
    }

    const scheduledAtIso = scheduledFor ? new Date(scheduledFor).toISOString() : null;

    setSubmitting(true);
    setError(null);

    try {
      await apiFetch<PostCreateResponse>("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mediaIds: uploadedMedia.map((item) => item.id),
          scheduledFor: scheduledAtIso,
          targets: selectedPlatforms.map((platform) => ({
            platform,
            customTitle: platformOverrides[platform]?.customTitle.trim(),
            customDescription: platformOverrides[platform]?.customDescription.trim(),
          })),
        }),
      });

      setScheduledFor("");
      setSelectedPlatforms([]);
      setPlatformOverrides({});
      clearUploadedMedia();

      await loadData();
    } catch (postError) {
      setError(postError instanceof Error ? postError.message : "Impossible de creer la publication.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Text tone="muted">Chargement du dashboard...</Text>;
  }

  return (
    <div className="dashboard-layout">
      <Card as="section">
        <SectionHeader
          title={`Bonjour ${userName}`}
          level={1}
          subtitle="Compose un contenu, choisis tes reseaux, puis publie tout de suite ou programme la diffusion."
        />

        <div className="metrics-grid">
          {metricItems.map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </Card>

      {!hasConnectedPlatforms ? (
        <Card as="section" className="connect-cta-card">
          <SectionHeader
            title="Commence par connecter un compte social"
            subtitle="Relie au moins une plateforme pour activer l'upload des medias et la publication." 
          />

          <div className="connect-cta-actions">
            <ButtonLink href="/settings">Connecter un compte social</ButtonLink>
          </div>
        </Card>
      ) : null}

      {hasConnectedPlatforms ? (
        <>
          <MediaUploadSection
            selectedFiles={selectedFiles}
            pendingFilePreviews={pendingFilePreviews}
            uploadedMedia={uploadedMedia}
            uploading={uploading}
            onSelectedFilesChange={handleSelectedFilesChange}
            onRemovePendingFile={removePendingFile}
            onRemoveUploadedMedia={removeUploadedMedia}
          />

          <PostComposerSection
            connectedPlatforms={connectedPlatforms}
            selectedPlatforms={selectedPlatforms}
            platformOverrides={platformOverrides}
            scheduledFor={scheduledFor}
            error={error}
            submitting={submitting}
            onSubmit={submitPost}
            onScheduledForChange={setScheduledFor}
            onTogglePlatform={togglePlatform}
            onUpdatePlatformOverride={updatePlatformOverride}
            getPlatformLabel={getPlatformLabel}
          />
        </>
      ) : null}

      <PublicationHistorySection history={history} getPlatformLabel={getPlatformLabel} />
    </div>
  );
}
