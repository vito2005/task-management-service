import { Task, TaskStatus } from "@domain/entities/task";
import { NotFoundError, ValidationError } from "@domain/errors/errors";
import type { Notifier } from "@domain/repositories/notifier";
import type { TaskRepository } from "@domain/repositories/task-repository";
import { DueDate } from "@domain/value-objects/due-date";

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  dueDate?: Date | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  dueDate?: Date | null;
  status?: TaskStatus;
}

export class TaskService {
  constructor(
    private readonly repository: TaskRepository,
    private readonly notifier: Notifier,
  ) {}

  async createTask(input: CreateTaskInput) {
    if (!input?.title || !input.title.trim()) {
      throw new ValidationError("Title is required", { title: "required" });
    }

    const due = input.dueDate ? DueDate.from(input.dueDate) : null;
    const task = Task.create({
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description ?? null,
      dueDate: due?.value ?? null,
    });

    const created = await this.repository.create(task);

    if ( due?.isWithinNextHours(24)) {
      await this.notifier.enqueueDueSoonNotification({
        taskId: created.id,
        title: created.title,
        dueDate: created.dueDate!.toISOString(),
      });
    }

    return created.toJSON();
  }

  async getTasks(filter?: { status?: "pending" | "completed" }) {
    const status = filter?.status ? this.parseStatus(filter.status) : undefined;
    const tasks = await this.repository.findAll({ status });
    return tasks.map((t) => t.toJSON());
  }

  async getTaskById(id: string) {
    const task = await this.repository.findById(id);
    if (!task) throw new NotFoundError("Task not found");
    return task.toJSON();
  }

  async updateTask(id: string, input: UpdateTaskInput) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError("Task not found");

    let due: DueDate | null = input.dueDate ? DueDate.from(input.dueDate) : null;

    existing.update({
      title: input.title,
      description: input.description,
      dueDate: due?.value ?? null,
      status: input.status ? this.parseStatus(input.status) : undefined,
    });

    const updated = await this.repository.update(existing);

    const dueValue = updated.dueDate ? DueDate.from(updated.dueDate) : null;
    if (dueValue?.isWithinNextHours(24)) {
      await this.notifier.enqueueDueSoonNotification({
        taskId: updated.id,
        title: updated.title,
        dueDate: updated.dueDate!.toISOString(),
      });
    }

    return updated.toJSON();
  }

  async deleteTask(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError("Task not found");
    await this.repository.delete(id);
  }

  private parseStatus(status: "pending" | "completed"): TaskStatus {
    switch (status) {
      case "pending":
        return TaskStatus.Pending;
      case "completed":
        return TaskStatus.Completed;
      default:
        throw new ValidationError("Invalid status", { status: "invalid" });
    }
  }
}
