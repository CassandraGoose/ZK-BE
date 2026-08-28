import { relations } from "drizzle-orm";
import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { toZodV4SchemaTyped } from "@/lib/zod-utils";

export const notes = pgTable("note", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  content: text().notNull().default(""),
  user_id: text().notNull(),
  created: timestamp({ withTimezone: true }).defaultNow(),
  edited: timestamp({ withTimezone: true }),
});

export const sources = pgTable("source", {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  artifact: text().notNull(),
  user_id: text().notNull(),
  created: timestamp({ withTimezone: true }).defaultNow(),
  edited: timestamp({ withTimezone: true }),
});

export const noteSources = pgTable(
  "note_source",
  {
    note_id: uuid()
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    source_id: uuid()
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    created: timestamp({ withTimezone: true }).defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.note_id, t.source_id] })],
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

export const createNotesSchema = toZodV4SchemaTyped(
  createInsertSchema(notes, {
    name: (field) => field.min(1).max(3000),
  })
    .required({
      name: true,
      content: true,
    })
    .omit({
      id: true,
      created: true,
      edited: true,
      user_id: true,
    })
    .extend({
      sourceId: z.uuid(),
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
      user_id: true,
    })
    .extend({
      noteId: z.uuid(),
    }),
);

export const insertNoteSourcesSchema = toZodV4SchemaTyped(
  createInsertSchema(noteSources)
    .required({ note_id: true, source_id: true })
    .omit({ created: true }),
);

export const notesRelations = relations(notes, ({ many }) => ({
  linkedSources: many(noteSources, { relationName: "noteToSourceLinks" }),
}));

export const sourcesRelations = relations(sources, ({ many }) => ({
  linkedNotes: many(noteSources, { relationName: "sourceToNoteLinks" }),
}));

export const noteSourcesRelations = relations(noteSources, ({ one }) => ({
  note: one(notes, {
    fields: [noteSources.note_id],
    references: [notes.id],
    relationName: "noteToSourceLinks",
  }),
  source: one(sources, {
    fields: [noteSources.source_id],
    references: [sources.id],
    relationName: "sourceToNoteLinks",
  }),
}));

// @ts-expect-error partial exists on zod v4 type
export const patchSourcesSchema = createSourceSchema.partial();

// @ts-expect-error partial exists on zod v4 type
export const patchNotesSchema = createNotesSchema.partial();

export const dbSchema = {
  notes,
  sources,
  noteSources,
  notesRelations,
  sourcesRelations,
  noteSourcesRelations,
};
