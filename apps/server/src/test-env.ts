process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.DATABASE_URL = process.env.DATABASE_URL ?? "file:./dev.db";
process.env.AUTH_SECRET =
  process.env.AUTH_SECRET ?? "test-secret-key-at-least-32-characters-long-for-jwt";
