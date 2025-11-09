import type { Task as TaskEntity } from "@domain/entities/task";
import { Task, TaskStatus } from "@domain/entities/task";
import type {
  TaskFilter,
  TaskRepository,
} from "@domain/repositories/task-repository";
import { db } from "@infrastructure/db/client";
import { tasks } from "@infrastructure/db/schema";
import { eq } from "drizzle-orm";

function toDomain(row: typeof tasks.$inferSelect): TaskEntity {
  return Task.create({
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    dueDate: row.dueDate ?? null,
    status:
      row.status === "completed" ? TaskStatus.Completed : TaskStatus.Pending,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class DrizzleTaskRepository implements TaskRepository {
  async create(task: TaskEntity): Promise<TaskEntity> {
    const json = task.toJSON();
    await db.insert(tasks).values({
      id: json.id,
      title: json.title,
      description: json.description ?? null,
      dueDate: json.dueDate ?? null,
      status: json.status,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
    });
    return task;
  }

  async findById(id: string): Promise<TaskEntity | null> {
    const rows = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    const row = rows[0];
    return row ? toDomain(row) : null;
  }

  async findAll(filter?: TaskFilter): Promise<TaskEntity[]> {
    const where = filter?.status ? eq(tasks.status, filter.status) : undefined;
    const rows = where
      ? await db.select().from(tasks).where(where)
      : await db.select().from(tasks);
    return rows.map(toDomain);
  }

  async update(task: TaskEntity): Promise<TaskEntity> {
    const json = task.toJSON();
    await db
      .update(tasks)
      .set({
        title: json.title,
        description: json.description ?? null,
        dueDate: json.dueDate ?? null,
        status: json.status,
        updatedAt: json.updatedAt,
      })
      .where(eq(tasks.id, json.id));
    return task;
  }

  async delete(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }
}
