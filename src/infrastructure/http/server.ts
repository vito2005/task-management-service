import { TaskService } from "@application/services/task-service";
import { config } from "@config/env";
import { ensureDatabaseSchema } from "@infrastructure/db/init";
import { RedisNotificationQueue } from "@infrastructure/queue/notification-queue";
import { DrizzleTaskRepository } from "@infrastructure/repositories/drizzle-task-repository";
import { Elysia } from "elysia";

import { taskRoutes } from "./routes/tasks";

const repo = new DrizzleTaskRepository();
const notifier = new RedisNotificationQueue();
const service = new TaskService(repo, notifier);

async function bootstrap() {
  await ensureDatabaseSchema();

  const app = new Elysia()
    .get("/health", () => ({ status: "ok" }))
    .use((a) => taskRoutes(a, service));
  app.listen(config.port);
  console.log(`🚀 API listening on http://localhost:${config.port}`);
}

bootstrap().catch((e) => {
  console.error("Failed to start server", e);
  process.exit(1);
});
