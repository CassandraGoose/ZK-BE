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
  const sources = await db.query.sources.findMany({ with: { linkedNotes: { with: { note: true } } } });
  const formattedSources = sources.map(({ linkedNotes, ...source }) => ({
    ...source,
    notes: linkedNotes.map((n) => n.note),
  }));
  return c.json(formattedSources);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const { noteId, ...source } = c.req.valid("json");

  const existingNote = await db
    .select()
    .from(notes)
    .where(eq(notes.id, noteId));

  if (!existingNote.length) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  const [inserted] = await db.insert(sources).values(source).returning();

  await db.insert(noteSources).values({ noteId, sourceId: inserted.id });
  return c.json({...inserted, notes: existingNote }, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id: idParam } = c.req.valid("param");
  const id = String(idParam);
  const source = await db.query.sources.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
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

  return c.json(source, HttpStatusCodes.OK);
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

  return c.json(source, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id: idParam } = c.req.valid("param");
  const id = String(idParam);
  const result = await db.delete(sources).where(eq(sources.id, id));

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
