"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button, ButtonLink, Card, SectionHeader, Text } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import type {
  SocialConnection,
  SocialConnectionsResponse,
  SocialDisconnectResponse,
} from "@/lib/api-types";

export function SettingsClient() {
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusMessage = useMemo(() => {
    const status = searchParams.get("status");
    const platform = searchParams.get("platform");
    const message = searchParams.get("message");

    if (status === "connected") {
      return `Compte ${platform ?? "reseau"} connecte avec succes.`;
    }

    if (status === "error") {
      return message ?? "Connexion OAuth impossible.";
    }

    if (status === "connect-required") {
      return "Connecte au moins un compte social pour activer l'upload de medias depuis le dashboard.";
    }

    return null;
  }, [searchParams]);

  const loadConnections = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<SocialConnectionsResponse>("/api/social/connections");
      setConnections(data.connections);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load connections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadConnections();
  }, []);

  const disconnect = async (platform: string) => {
    setError(null);

    try {
      await apiFetch<SocialDisconnectResponse>("/api/social/connections", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ platform }),
      });

      await loadConnections();
    } catch (disconnectError) {
      setError(disconnectError instanceof Error ? disconnectError.message : "Unable to disconnect account.");
    }
  };

  if (loading) {
    return <Text tone="muted">Chargement des connexions...</Text>;
  }

  return (
    <section className="dashboard-layout">
      <Card as="article">
        <SectionHeader
          level={1}
          title="Parametres et comptes sociaux"
          subtitle="Connecte LinkedIn, Instagram, Facebook, Threads, Pinterest, YouTube et Google Business via OAuth2."
        />

        {statusMessage ? <Text tone="info">{statusMessage}</Text> : null}
        {error ? <Text tone="error">{error}</Text> : null}
      </Card>

      <div className="settings-grid">
        {connections.map((connection) => (
          <Card as="article" className="settings-card" key={connection.platform}>
            <SectionHeader
              title={connection.label}
              subtitle={
                connection.connected
                  ? `Connecte en tant que ${connection.username ?? "compte lie"}`
                  : "Compte non connecte"
              }
            />

            <div className="settings-actions">
              <ButtonLink href={`/api/social/oauth/${connection.slug}/start`}>
                {connection.connected ? "Reconnecter" : "Connecter"}
              </ButtonLink>

              {connection.connected ? (
                <Button
                  variant="outline"
                  onClick={() => disconnect(connection.platform)}
                >
                  Deconnecter
                </Button>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
