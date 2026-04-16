import { Card, SectionHeader, Text } from "@/components/ui";
import type { PostHistoryItem } from "@/lib/api-types";

type PublicationHistorySectionProps = {
  history: PostHistoryItem[];
  getPlatformLabel: (platform: string) => string;
};

export function PublicationHistorySection({
  history,
  getPlatformLabel,
}: PublicationHistorySectionProps) {
  return (
    <Card as="section">
      <SectionHeader title="Historique des publications" />

      {history.length ? (
        <div className="history-list">
          {history.map((item) => (
            <article className="history-card" key={item.id}>
              <div className="history-head">
                <strong>
                  Publication sur {item.targets.length} plateforme
                  {item.targets.length > 1 ? "s" : ""}
                </strong>
                <Text as="span" className="status-badge">
                  {item.status}
                </Text>
              </div>
              <Text tone="mini" as="p">
                Cree le {new Date(item.createdAt).toLocaleString()} | Cibles: {item.targets.length}
              </Text>

              <ul className="target-preview-list">
                {item.targets.map((target) => (
                  <li className="target-preview-item" key={target.id}>
                    <div className="history-head">
                      <strong>{getPlatformLabel(target.platform)}</strong>
                      <Text as="span" className="status-badge">
                        {target.status}
                      </Text>
                    </div>
                    <Text tone="mini" as="p">
                      Titre: {target.customTitle ?? "Non renseigne"}
                    </Text>
                    <Text tone="mini" as="p">
                      Description: {target.customDescription ?? "Non renseignee"}
                    </Text>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      ) : (
        <Text tone="muted" as="p">
          Aucune publication pour le moment.
        </Text>
      )}
    </Card>
  );
}
