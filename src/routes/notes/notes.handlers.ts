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
} from "./notes.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const notes = await db.query.notes.findMany({
    with: { linkedSources: { with: { source: true } } },
  });
  const formattedNotes = notes.map(({ linkedSources, ...note }) => ({
    ...note,
    sources: linkedSources.map((source) => source.source),
  }));
  return c.json(formattedNotes);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const { sourceId, ...note } = c.req.valid("json");

  const linkedSource = await db
    .select()
    .from(sources)
    .where(eq(sources.id, sourceId));

  if (!linkedSource.length) {
    return c.json(
      {
        message: `${HttpStatusPhrases.NOT_FOUND}: the source you are trying to link does not exist.`,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }
  const [inserted] = await db.insert(notes).values(note).returning();

  await db
    .insert(noteSources)
    .values({ source_id: sourceId, note_id: inserted.id });

  return c.json({ ...inserted, sources: linkedSource }, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id: idParam } = c.req.valid("param");
  const id = String(idParam);
  const note = await db.query.notes.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
    with: { linkedSources: { with: { source: true } } },
  });

  if (!note) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(
    { ...note, sources: note.linkedSources.map((source) => source.source) },
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

  const [note] = await db
    .update(notes)
    .set(updates)
    .where(eq(notes.id, id))
    .returning();

  if (!note) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  const linkedSources = await db.query.noteSources.findMany({
    where(fields, operators) {
      return operators.eq(fields.note_id, note.id);
    },
    with: { source: true },
  });

  return c.json(
    { ...note, sources: linkedSources.map(({ source }) => source) },
    HttpStatusCodes.OK,
  );
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id: idParam } = c.req.valid("param");
  const id = String(idParam);
  const result = await db.delete(notes).where(eq(notes.id, id));

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
