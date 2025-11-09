import type { Task, TaskId, TaskStatus } from "@domain/entities/task";

export interface TaskFilter {
  status?: TaskStatus;
}

export interface TaskRepository {
  create(task: Task): Promise<Task>;
  findById(id: TaskId): Promise<Task | null>;
  findAll(filter?: TaskFilter): Promise<Task[]>;
  update(task: Task): Promise<Task>;
  delete(id: TaskId): Promise<void>;
}
