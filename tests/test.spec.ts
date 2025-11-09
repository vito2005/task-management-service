const baseUrl = process.env.BASE_URL || "http://localhost:3000";

type Json = Record<string, unknown>;

interface TaskDTO {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: "pending" | "completed";
  createdAt: string;
  updatedAt: string;
  property?: string;
  message?: string;
}

async function req<T>(
  method: string,
  path: string,
  body?: Json
): Promise<{ status: number; json: T }> {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  return { status: res.status, json: parsed as T };
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

function log(step: string, detail?: unknown) {
  console.log(`✔ ${step}`, detail ?? "");
}

const dueSoon = new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString();

// 1) Create
const created1 = await req<TaskDTO>("POST", "/tasks", {
  title: "Smoke Task",
  description: "created by smoke test",
  dueDate: dueSoon,
});
const created2 = await req<TaskDTO>("POST", "/tasks", {
  title: "Smoke Task Completed",
  description: "created by smoke test",
});
assert(created1.status === 201, `POST /tasks expected 201, got ${created1.status}`);
assert(created2.status === 201, `POST /tasks expected 201, got ${created2.status}`);
assert(created1.json.id, "created task should have id");
assert(created2.json.id, "created task should have id");
const id1 = created1.json.id;
const id2 = created2.json.id;
log("create task 1", created1.json);
log("create task 2", created2.json);

// 1.1) Create with invalid title
const created3 = await req<TaskDTO>("POST", "/tasks", {
  title: "",
  description: "created by smoke test",
});
assert(created3.status === 422, `POST /tasks expected 400, got ${created3.status}`);
assert(created3.json.property === "/title","property should be /title");
assert(created3.json.message === "Expected string length greater or equal to 1","message should be Expected string length greater or equal to 1");
log("create task with invalid title", created3.json);

// 2) List
const list = await req<TaskDTO[]>("GET", "/tasks");
assert(list.status === 200, `GET /tasks expected 200, got ${list.status}`);
assert(Array.isArray(list.json), "list should be an array");
assert(list.json.some((t) => t.id === id1), "created task 1 present in list");
assert(list.json.some((t) => t.id === id2), "created task 2 present in list");
log("list tasks count", list.json.length);  

// 3) Get by id
const got = await req<TaskDTO>("GET", `/tasks/${id1}`);
assert(got.status === 200, `GET /tasks/:id expected 200, got ${got.status}`);
assert(got.json.id === id1, "get by id returns the same id");
log("get task by id");

// 3.1) Get by id not found
const notFound = await req<Json>("GET", `/tasks/${crypto.randomUUID()}`);
assert(notFound.status === 404, `GET /tasks/:id expected 404, got ${notFound.status}`);
log("get task by id not found");

// 4) Update
const updated = await req<TaskDTO>("PUT", `/tasks/${id1}`, {
  title: "Smoke Task 1 Updated",
  status: "completed",
});
assert(updated.status === 200, `PUT /tasks/:id expected 200, got ${updated.status}`);
assert(updated.json.status === "completed", "status should be completed");
assert(updated.json.title === "Smoke Task 1 Updated", "title updated");
log("update task");

// 4.1) Update not found
const notFound2 = await req<Json>("PUT", `/tasks/${crypto.randomUUID()}`, {
  title: "Smoke Task 1 Updated",
  status: "completed",
});
assert(notFound2.status === 404, `PUT /tasks/:id expected 404, got ${notFound2.status}`);
log("update task not found");

// 5) Filter completed
const completed = await req<TaskDTO[]>("GET", `/tasks?status=completed`);
assert(completed.status === 200, `GET /tasks?status=completed expected 200, got ${completed.status}`);
assert(completed.json.some((t) => t.id === id1), "updated task present in completed list");
assert(!completed.json.some((t) => t.id === id2), "created task 2 not present in completed list");
log("filter completed", completed.json);

// 5.1) Filter with not supported status - processed
const invalidStatus = await req<TaskDTO[]>("GET", `/tasks?status=processed`);
assert(invalidStatus.status === 422, `GET /tasks?status=processed expected 422, got ${invalidStatus.status}`);
log("filter with invalid status", invalidStatus.json);

// 6) Delete
const deleted1 = await req<string | null>("DELETE", `/tasks/${id1}`);
const deleted2 = await req<string | null>("DELETE", `/tasks/${id2}`);
assert(deleted1.status === 204, `DELETE /tasks/:id expected 204, got ${deleted1.status}`);
assert(deleted2.status === 204, `DELETE /tasks/:id expected 204, got ${deleted2.status}`);
log("delete task");

// 6.1) Delete not found
const notFound3 = await req<Json>("DELETE", `/tasks/${crypto.randomUUID()}`);
assert(notFound3.status === 404, `DELETE /tasks/:id expected 404, got ${notFound3.status}`);
log("delete task not found");

// 7) Get after delete -> 404
const afterDelete = await req<Json>("GET", `/tasks/${id1}`);
assert(afterDelete.status === 404, `GET after delete expected 404, got ${afterDelete.status}`);
log("verify 404 after delete");

// 8) Get list after delete
const listAfterDelete = await req<TaskDTO[]>("GET", "/tasks");
assert(listAfterDelete.status === 200, `GET /tasks expected 200, got ${listAfterDelete.status}`);
assert(listAfterDelete.json.length === 0, "list should be empty");
log("list after delete", listAfterDelete.json);

console.log("\n🎉 Smoke tests passed");


