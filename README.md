## Task Management Service

### Stack
- Runtime: Bun.js
- HTTP: Elysia.js
- ORM: Drizzle ORM (PostgreSQL, node-postgres)
- Queue/Cache: Redis imitation
- Containers: Docker + docker-compose

### Architecture

- Domain (tasks, errors, interfaces)
- Application (task service)
- Infrastructure (HTTP server, DB adapters, repository impl, Redis queue imitation)

### Quick start (Docker)

1. Ensure Docker is running.
2. Start services:
   ```bash
   docker compose up --build
   ```
3. API available at http://localhost:3000

### Environment

Required variables:

- `POSTGRES_URL` (e.g., `postgresql://postgres:postgres@postgres:5432/tasks`)
- `REDIS_URL` (e.g., `redis://redis:6379`)

### Scripts

- `bun dev` — start API with hot reload
- `bun start` — start API
- `bun worker` — start Redis notification worker

### API

- POST `/tasks`
- GET `/tasks?status=pending|completed`
- GET `/tasks/:id`
- PUT `/tasks/:id`
- DELETE `/tasks/:id`

### Notes

- When a task has a `dueDate` within 24 hours, a notification job is enqueued to Redis and processed by the worker, which writes a log entry to `logs/notifications.log`.
