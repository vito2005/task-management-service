import "dotenv/config";

export const config = {
  port: parseInt(process?.env?.PORT || "3000"),
  nodeEnv: process.env.NODE_ENV || "development",
  postgresUrl: process.env.POSTGRES_URL || "",
  redisUrl: process.env.REDIS_URL || "",
  logDir: process.env.LOG_DIR || "logs",
};

if (!config.postgresUrl) {
  throw new Error("POSTGRES_URL is not set");
}
if (!config.redisUrl) {
  throw new Error("REDIS_URL is not set");
}
