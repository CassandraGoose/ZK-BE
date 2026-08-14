import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { toZodV4SchemaTyped } from "@/lib/zod-utils";

export const notes = pgTable("note", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  created: timestamp({ withTimezone: true }).defaultNow(),
  edited: timestamp({ withTimezone: true }),
});

export const sources = pgTable("source", {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  artifact: text().notNull(),
  created: timestamp({ withTimezone: true }).defaultNow(),
  edited: timestamp({ withTimezone: true }),
});

export const noteSources = pgTable(
  "note_source",
  {
    noteId: uuid()
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    sourceId: uuid()
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    created: timestamp({ withTimezone: true }).defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.noteId, t.sourceId] })],
);

export const selectNotesSchema = toZodV4SchemaTyped(
  createSelectSchema(notes).extend({
    sources: z.array(createSelectSchema(sources)),
  }),
);

export const selectSourcesSchema = toZodV4SchemaTyped(
  createSelectSchema(sources).extend({
    notes: z.array(createSelectSchema(notes)),
  }),
);

export const selectNoteSourcesSchema = toZodV4SchemaTyped(
  createSelectSchema(noteSources),
);

export const insertNotesSchema = toZodV4SchemaTyped(
  createInsertSchema(notes, {
    name: (field) => field.min(1).max(3000),
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


export const insertSourcesSchema = toZodV4SchemaTyped(
  createInsertSchema(sources, {
    title: (field) => field.min(1).max(1000),
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

export const createSourceSchema = toZodV4SchemaTyped(
  createInsertSchema(sources, {
    title: (field) => field.min(1).max(1000),
  })
    .required({
      title: true,
      artifact: true,
    })
    .omit({
      id: true,
      created: true,
      edited: true,
    })
    .extend({
      noteId: z.uuid(),
    }),
);

export const insertNoteSourcesSchema = toZodV4SchemaTyped(
  createInsertSchema(noteSources)
    .required({ noteId: true, sourceId: true })
    .omit({ id: true, created: true }),
);

export const notesRelations = relations(notes, ({ many }) => ({
  links: many(noteSources),
}));

export const sourcesRelations = relations(sources, ({ many }) => ({
  links: many(noteSources),
}));

export const noteSourcesRelations = relations(noteSources, ({ one }) => ({
  note: one(notes, { fields: [noteSources.noteId], references: [notes.id] }),
  source: one(sources, {
    fields: [noteSources.sourceId],
    references: [sources.id],
  }),
}));


// @ts-expect-error partial exists on zod v4 type
export const patchSourcesSchema = insertSourcesSchema.partial();

// @ts-expect-error partial exists on zod v4 type
export const patchNotesSchema = insertNotesSchema.partial();
