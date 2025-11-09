import type {
  TaskService,
  UpdateTaskInput,
} from "@application/services/task-service";
import { TaskStatus } from "@domain/entities/task";
import { toHttpError } from "@infrastructure/http/errors";
import { Elysia, t } from "elysia";

const taskStatus = t.Union([
  t.Literal(TaskStatus.Pending),
  t.Literal(TaskStatus.Completed),
]);

export const taskRoutes = (app: Elysia, service: TaskService) =>
  app.group("/tasks", (group) =>
    group
      .post(
        "/",
        async ({ body, set }) => {
          try {
            const created = await service.createTask(body);
            set.status = 201;
            return created;
          } catch (err) {
            const http = toHttpError(err);
            set.status = http.status;
            return http.body;
          }
        },
        {
          body: t.Object({
            title: t.String({ minLength: 1 }),
            description: t.Optional(t.Union([t.String(), t.Null()])),
            dueDate: t.Optional(t.Union([t.Date({ format: "iso" }), t.Null()])),
          }),
        }
      )
      .get(
        "/",
        async ({ query, set }) => {
          try {
            const tasks = await service.getTasks({
              status: query.status as TaskStatus | undefined,
            });
            return tasks;
          } catch (err) {
            const http = toHttpError(err);
            set.status = http.status;
            return http.body;
          }
        },
        {
          query: t.Object({
            status: t.Optional(taskStatus),
          }),
        }
      )
      .get("/:id", async ({ params, set }) => {
        try {
          const task = await service.getTaskById(params.id);
          return task;
        } catch (err) {
          const http = toHttpError(err);
          set.status = http.status;
          return http.body;
        }
      })
      .put(
        "/:id",
        async ({ params, body, set }) => {
          try {
            const updated = await service.updateTask(
              params.id,
              body as UpdateTaskInput
            );
            return updated;
          } catch (err) {
            const http = toHttpError(err);
            set.status = http.status;
            return http.body;
          }
        },
        {
          body: t.Object({
            title: t.Optional(t.String({ minLength: 1 })),
            description: t.Optional(t.Union([t.String(), t.Null()])),
            dueDate: t.Optional(t.Union([t.Date({ format: "iso" }), t.Null()])),
            status: t.Optional(taskStatus),
          }),
        }
      )
      .delete("/:id", async ({ params, set }) => {
        try {
          await service.deleteTask(params.id);
          set.status = 204;
          return "";
        } catch (err) {
          const http = toHttpError(err);
          set.status = http.status;
          return http.body;
        }
      })
  );
