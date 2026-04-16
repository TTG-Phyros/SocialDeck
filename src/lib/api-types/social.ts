export type SocialConnection = {
  platform: string;
  slug: string;
  label: string;
  connected: boolean;
  username: string | null;
  expiresAt: string | null;
  connectedAt: string | null;
  updatedAt: string | null;
};

export type SocialConnectionsResponse = {
  connections: SocialConnection[];
};

export type SocialDisconnectResponse = {
  disconnected: boolean;
  platform: string;
};