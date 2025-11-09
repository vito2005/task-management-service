export interface Notifier {
  enqueueDueSoonNotification(payload: {
    taskId: string;
    title: string;
    dueDate: string; // ISO string
  }): Promise<void>;
}
