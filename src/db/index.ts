import { drizzle } from "drizzle-orm/node-postgres";

import env from "@/env";

import { dbSchema } from "./schema";


const db = drizzle({
  connection: env.DATABASE_URL,
  schema: dbSchema,
});

export default db;
