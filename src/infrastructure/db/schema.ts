import { pgEnum,pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const taskStatusEnum = pgEnum('task_status', ['pending', 'completed']);

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date', { withTimezone: false }),
  status: taskStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: false }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: false }).notNull().defaultNow(),
});


