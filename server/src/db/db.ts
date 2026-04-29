import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { config } from "../config.js";
import * as schema from "./schema.js";

export function createDb(url?: string) {
  const conn = postgres(url ?? config.db.url);
  return drizzle(conn, { schema });
}

// default export for application code
export const db = createDb();
