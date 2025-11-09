import 'dotenv/config';

import { promises as fs } from 'fs';
import path from 'path';

import { QUEUE_KEY } from './notification-queue';
import { redis } from './redis-client';

const LOG_DIR = process.env.LOG_DIR || path.resolve(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'notifications.log');

async function ensureLogDir() {
  await fs.mkdir(LOG_DIR, { recursive: true });
}

async function appendLog(line: string) {
  await ensureLogDir();
  await fs.appendFile(LOG_FILE, line + '\n', 'utf8');
}

async function main() {
  console.log('[worker] Listening for notifications...');
  while (true) {
    try {
      const result = await redis.brpop(QUEUE_KEY, 0);
      if (!result) {
        continue;
      }
      const [, raw] = result;
      const msg = JSON.parse(raw);
      const line = `[${new Date().toISOString()}] type=${msg.type} taskId=${msg.taskId} title=${JSON.stringify(msg.title)} dueDate=${msg.dueDate}`;
      console.log('[worker] Notification:', line);
      await appendLog(line);
    } catch (err) {
      console.error('[worker] Error processing message', err);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

main().catch((e) => {
  console.error('[worker] Fatal error', e);
  process.exit(1);
});


