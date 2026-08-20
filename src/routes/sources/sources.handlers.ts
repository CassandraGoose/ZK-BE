import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { notes, noteSources, sources } from "@/db/schema";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";

import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./sources.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const sources = await db.query.sources.findMany({
    with: { linkedNotes: { with: { note: true } } },
  });
  const formattedSources = sources.map(({ linkedNotes, ...source }) => ({
    ...source,
    notes: linkedNotes.map((note) => note.note),
  }));
  return c.json(formattedSources);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const { noteId, ...source } = c.req.valid("json");

  const existingNote = await db
    .select()
    .from(notes)
    .where(eq(notes.id, noteId));
  // todo fix all returning items having linkednotes and notes
  if (!existingNote.length) {
    return c.json(
      {
        message: `${HttpStatusPhrases.NOT_FOUND}: the note you are trying to link does not exist.`,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  const [inserted] = await db.insert(sources).values(source).returning();

  await db
    .insert(noteSources)
    .values({ note_id: noteId, source_id: inserted.id });

  return c.json({ ...inserted, notes: existingNote }, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id: idParam } = c.req.valid("param");
  const id = String(idParam);
  const source = await db.query.sources.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
    with: {
      linkedNotes: { with: { note: true } },
    },
  });

  if (!source) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(
    {
      ...source,
      notes: source.linkedNotes.map((note) => note.note),
    },
    HttpStatusCodes.OK,
  );
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id: idParam } = c.req.valid("param");
  const id = String(idParam);
  const updates = c.req.valid("json");

  if (Object.keys(updates).length === 0) {
    return c.json(
      {
        success: false,
        error: {
          issues: [
            {
              code: ZOD_ERROR_CODES.INVALID_UPDATES,
              path: [],
              message: ZOD_ERROR_MESSAGES.NO_UPDATES,
            },
          ],
          name: "ZodError",
        },
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  const [source] = await db
    .update(sources)
    .set(updates)
    .where(eq(sources.id, id))
    .returning();

  if (!source) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  const linkedNotes = await db.query.noteSources.findMany({
    where(fields, operators) {
      return operators.eq(fields.source_id, source.id);
    },
    with: { note: true },
  });

  return c.json(
    {
      ...source,
      notes: linkedNotes.map(({ note }) => note),
    },
    HttpStatusCodes.OK,
  );
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id: idParam } = c.req.valid("param");
  const id = String(idParam);
  const result = await db.delete(sources).where(eq(sources.id, id));
  // remove related note_sources connections to this source
  if (result.rowCount === 0) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
