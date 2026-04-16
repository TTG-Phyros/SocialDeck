const defaultAuthSecret = "dev-auth-secret-change-me-1234567890";

export const env = {
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  authSecret: process.env.AUTH_SECRET ?? defaultAuthSecret,
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  uploadDir: process.env.UPLOAD_DIR ?? "storage/uploads",
};
