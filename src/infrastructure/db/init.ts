import { pool } from "./client";

export async function ensureDatabaseSchema(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE task_status AS ENUM ('pending', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id text PRIMARY KEY,
        title text NOT NULL,
        description text,
        due_date timestamp NULL,
        status task_status NOT NULL DEFAULT 'pending',
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
      );
    `);
  } finally {
    client.release();
  }
}
