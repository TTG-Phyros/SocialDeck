export type DashboardMetrics = {
  totalPosts: number;
  scheduledPosts: number;
  completedPosts: number;
  failedPosts: number;
  connectedPlatforms: number;
};

export type DashboardRecentAttempt = {
  id: string;
  platform: string;
  status: string;
  errorMessage: string | null;
  attemptedAt: string;
  postId: string;
};

export type DashboardResponse = {
  metrics: DashboardMetrics;
  recentAttempts: DashboardRecentAttempt[];
};