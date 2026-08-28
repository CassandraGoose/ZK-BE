import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { testClient } from "hono/testing";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { beforeAll, describe, expect, expectTypeOf, it } from "vitest";
import { ZodIssueCode } from "zod";

import db from "@/db";
import { sources } from "@/db/schema";
import env from "@/env";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";
import { createTestApp } from "@/lib/create-app";

import router from "./notes.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient(createTestApp(router));

describe("notes routes", () => {
  let sourceId: string;

  beforeAll(async () => {
    const result = await db.execute<Record<string, unknown>>(
      sql`SELECT current_database()`,
    );
    const dbName = result.rows[0].current_database;

    if (dbName !== "zk_test") {
      throw new Error(
        `Refusing to drop schema on database "${dbName}" — expected "zk_test"`,
      );
    }

    await db.execute(
      sql`DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;`,
    );
    await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE;`);
    await migrate(db, { migrationsFolder: "./src/db/migrations" });

    const [source] = await db
      .insert(sources)
      .values({
        title: "Test source",
        artifact: "https://example.com",
        user_id: "00000000-0000-0000-0000-000000000000",
      })
      .returning();
    sourceId = source.id;
  });

  it("post /notes validates the body when creating", async () => {
    const response = await client.notes.$post({
      json: {},
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("name");
      expect(json.error.issues[0].message).toBe(
        ZOD_ERROR_MESSAGES.EXPECTED_STRING,
      );
    }
  });

  let noteId: string;
  const name = "Learn vitest";

  it("post /notes creates a note", async () => {
    const response = await client.notes.$post({
      json: {
        name,
        content: "Some content",
        sourceId,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.name).toBe(name);
      noteId = json.id;
    }
  });

  it("get /notes lists all notes", async () => {
    const response = await client.notes.$get();
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expectTypeOf(json).toBeArray();
      expect(json.length).toBe(1);
    }
  });

  it("get /notes/{id} validates the id param", async () => {
    const response = await client.notes[":id"].$get({
      param: {
        id: "wat",
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(
        ZOD_ERROR_MESSAGES.INVALID_UUID,
      );
    }
  });

  it("get /notes/{id} returns 404 when note not found", async () => {
    const response = await client.notes[":id"].$get({
      param: {
        id: "00000000-0000-0000-0000-000000000000",
      },
    });
    expect(response.status).toBe(404);
    if (response.status === 404) {
      const json = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    }
  });

  it("get /notes/{id} gets a single note", async () => {
    const response = await client.notes[":id"].$get({
      param: {
        id: noteId,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.name).toBe(name);
    }
  });

  it("patch /notes/{id} validates the body when updating", async () => {
    const response = await client.notes[":id"].$patch({
      param: {
        id: noteId,
      },
      json: {
        name: "",
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("name");
      expect(json.error.issues[0].code).toBe(ZodIssueCode.too_small);
    }
  });

  it("patch /notes/{id} validates the id param", async () => {
    const response = await client.notes[":id"].$patch({
      param: {
        id: "wat",
      },
      json: {},
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(
        ZOD_ERROR_MESSAGES.INVALID_UUID,
      );
    }
  });

  it("patch /notes/{id} validates empty body", async () => {
    const response = await client.notes[":id"].$patch({
      param: {
        id: noteId,
      },
      json: {},
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].code).toBe(ZOD_ERROR_CODES.INVALID_UPDATES);
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.NO_UPDATES);
    }
  });

  it("patch /notes/{id} updates a single property of a note", async () => {
    const response = await client.notes[":id"].$patch({
      param: {
        id: noteId,
      },
      json: {
        name: "updated",
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const _json = await response.json();
    }
  });

  it("delete /notes/{id} validates the id when deleting", async () => {
    const response = await client.notes[":id"].$delete({
      param: {
        id: "wat",
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(
        ZOD_ERROR_MESSAGES.INVALID_UUID,
      );
    }
  });

  it("delete /notes/{id} removes a note", async () => {
    const response = await client.notes[":id"].$delete({
      param: {
        id: noteId,
      },
    });
    expect(response.status).toBe(204);
  });
});
