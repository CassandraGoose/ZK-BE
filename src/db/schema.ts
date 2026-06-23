import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { toZodV4SchemaTyped } from "@/lib/zod-utils";

export const notes = pgTable("note", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  created: timestamp({ withTimezone: true }).defaultNow(),
  edited: timestamp({ withTimezone: true }),
});

export const selectNotesSchema = toZodV4SchemaTyped(createSelectSchema(notes));

export const insertNotesSchema = toZodV4SchemaTyped(
  createInsertSchema(notes, {
    name: (field) => field.min(1).max(500),
  })
    .required({
      name: true,
    })
    .omit({
      id: true,
      created: true,
      edited: true,
    }),
);

// @ts-expect-error partial exists on zod v4 type
export const patchNotesSchema = insertNotesSchema.partial();
