import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
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
    name: field => field.min(1).max(3000),
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

export const sources = pgTable("source", {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  artifact: text().notNull(),
  created: timestamp({ withTimezone: true }).defaultNow(),
  edited: timestamp({ withTimezone: true }),
});

export const selectSourcesSchema = toZodV4SchemaTyped(
  createSelectSchema(sources),
);

export const insertSourcesSchema = toZodV4SchemaTyped(
  createInsertSchema(sources, {
    title: field => field.min(1).max(1000),
  })
    .required({
      title: true,
      artifact: true,
    })
    .omit({
      id: true,
      created: true,
      edited: true,
    }),
);

// @ts-expect-error partial exists on zod v4 type
export const patchSourcesSchema = insertSourcesSchema.partial();
