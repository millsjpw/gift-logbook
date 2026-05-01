import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { config } from "../config.js";

async function main() {
  const client = postgres(config.db.url, {
    max: 1,
    onnotice: () => {},
  });

  await migrate(drizzle(client), {
    migrationsFolder: "./src/db/migrations",
  });

  await client.end();

  console.log("Migrations complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});