import type { Notifier } from "@domain/repositories/notifier";

import { redis } from "./redis-client";

const QUEUE_KEY = "notifications";

export class RedisNotificationQueue implements Notifier {
  async enqueueDueSoonNotification(payload: {
    taskId: string;
    title: string;
    dueDate: string;
  }): Promise<void> {
    await redis.lpush(
      QUEUE_KEY,
      JSON.stringify({
        type: "due_soon",
        ...payload,
        enqueuedAt: new Date().toISOString(),
      })
    );
  }
}

export { QUEUE_KEY };
