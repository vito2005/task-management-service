export type TaskId = string;

export enum TaskStatus {
  Pending = "pending",
  Completed = "completed",
}

export interface TaskProps {
  id: TaskId;
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Task {
  private props: TaskProps;

  private constructor(props: TaskProps) {
    this.props = props;
  }

  static create(params: {
    id: TaskId;
    title: string;
    description?: string | null;
    dueDate?: Date | null;
    status?: TaskStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }): Task {
    const now = new Date();
    const props: TaskProps = {
      id: params.id,
      title: params.title.trim(),
      description: params.description ?? null,
      dueDate: params.dueDate ?? null,
      status: params.status ?? TaskStatus.Pending,
      createdAt: params.createdAt ?? now,
      updatedAt: params.updatedAt ?? now,
    };
    if (!props.title) {
      throw new Error("Title must not be empty");
    }
    return new Task(props);
  }

  update(fields: Partial<Omit<TaskProps, "id" | "createdAt">>): void {
    if (fields.title) {
      this.props.title = fields.title;
    }
    if (fields.description) {
      this.props.description = fields.description ?? null;
    }
    if (fields.dueDate) {
      this.props.dueDate = fields.dueDate ?? null;
    }
    if (fields.status) {
      this.props.status = fields.status;
    }
    this.props.updatedAt = new Date();
  }

  toJSON(): TaskProps {
    return { ...this.props };
  }

  get id(): TaskId {
    return this.props.id;
  }
  get title(): string {
    return this.props.title;
  }
  get description(): string | null | undefined {
    return this.props.description;
  }
  get dueDate(): Date | null | undefined {
    return this.props.dueDate;
  }
  get status(): TaskStatus {
    return this.props.status;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
