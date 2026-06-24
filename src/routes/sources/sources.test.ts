import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { testClient } from "hono/testing";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { beforeAll, describe, expect, expectTypeOf, it } from "vitest";
import { ZodIssueCode } from "zod";

import db from "@/db";
import env from "@/env";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";
import { createTestApp } from "@/lib/create-app";

import router from "./sources.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient(createTestApp(router));

describe("sources routes", () => {
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
  });

  it("post /sources validates the body when creating", async () => {
    const response = await client.sources.$post({
      json: {},
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("title");
      expect(json.error.issues[0].message).toBe(
        ZOD_ERROR_MESSAGES.EXPECTED_STRING,
      );
    }
  });

  let sourceID: string;
  const title = "Learn vitest";
  const artifact = "https://url.com";

  it("post /sources creates a note", async () => {
    const response = await client.sources.$post({
      json: {
        title,
        artifact,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.title).toBe(title);
      sourceID = json.id;
    }
  });

  it("get /sources lists all sources", async () => {
    const response = await client.sources.$get();
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expectTypeOf(json).toBeArray();
      expect(json.length).toBe(1);
    }
  });

  it("get /sources/{id} validates the id param", async () => {
    const response = await client.sources[":id"].$get({
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

  it("get /sources/{id} returns 404 when note not found", async () => {
    const response = await client.sources[":id"].$get({
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

  it("get /sources/{id} gets a single note", async () => {
    const response = await client.sources[":id"].$get({
      param: {
        id: sourceID,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.title).toBe(title);
    }
  });

  it("patch /sources/{id} validates the body when updating", async () => {
    const response = await client.sources[":id"].$patch({
      param: {
        id: sourceID,
      },
      json: {
        title: "",
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("title");
      expect(json.error.issues[0].code).toBe(ZodIssueCode.too_small);
    }
  });

  it("patch /sources/{id} validates the id param", async () => {
    const response = await client.sources[":id"].$patch({
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

  it("patch /sources/{id} validates empty body", async () => {
    const response = await client.sources[":id"].$patch({
      param: {
        id: sourceID,
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

  it("patch /sources/{id} updates a single property of a note", async () => {
    const response = await client.sources[":id"].$patch({
      param: {
        id: sourceID,
      },
      json: {
        title: "updated",
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const _json = await response.json();
    }
  });

  it("delete /sources/{id} validates the id when deleting", async () => {
    const response = await client.sources[":id"].$delete({
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

  it("delete /sources/{id} removes a note", async () => {
    const response = await client.sources[":id"].$delete({
      param: {
        id: sourceID,
      },
    });
    expect(response.status).toBe(204);
  });
});
