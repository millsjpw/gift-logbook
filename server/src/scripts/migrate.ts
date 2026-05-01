import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { dbConfig } from "../config/db.js";

async function main() {
  const client = postgres(dbConfig.url, {
    max: 1,
    onnotice: () => {},
  });

  await migrate(drizzle(client), dbConfig.migrationConfig);

  await client.end();

  console.log("Migrations complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
