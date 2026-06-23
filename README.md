# ZK - Zettlekasten API 
## Built with W3CJ's Hono Open API Starter Kit - A starter template for building fully documented type-safe JSON APIs with Hono and Open API.

---

## This API serves users with a collection of their notes, tied to sources. Users can explore their related notes and sources and add/edit them. As their collection grows, to enhance understanding and make connections, users can view a graph of their notes connected via concepts/ideas/categories crafted by AI (coming soon)

## Included, from Hono Open API Starter Kit

- Structured logging with [pino](https://getpino.io/) / [hono-pino](https://www.npmjs.com/package/hono-pino)
- Documented / type-safe routes with [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
- Interactive API documentation with [scalar](https://scalar.com/#api-docs) / [@scalar/hono-api-reference](https://github.com/scalar/scalar/tree/main/packages/hono-api-reference)
- Convenience methods / helpers to reduce boilerplate with [stoker](https://www.npmjs.com/package/stoker)
- Type-safe schemas and environment variables with [zod](https://zod.dev/)
- Single source of truth database schemas with [drizzle](https://orm.drizzle.team/docs/overview) and [drizzle-zod](https://orm.drizzle.team/docs/zod)
- Testing with [vitest](https://vitest.dev/)
- Sensible editor, formatting and linting settings with [@antfu/eslint-config](https://github.com/antfu/eslint-config)

## Setup

Create `.env` file

```sh
cp .env.example .env
```

Install dependencies

```sh
npm install
```

Create db / push schema

```sh
npm drizzle-kit generate
npm drizzle-kit push
```

Run

```sh
pnpm dev
```

Lint & Format

```sh
pnpm lintformat
```

Test

```sh
pnpm test
```

## Endpoints

| Path               | Description              |
| ------------------ | ------------------------ |
| GET /doc           | Open API Specification   |
| GET /reference     | Scalar API Documentation |
| GET /notes         | List all notes           |
| POST /notes        | Create a note            |
| GET /notes/{id}    | Get one note by id       |
| PATCH /notes/{id}  | Patch one note by id     |
| DELETE /notes/{id} | Delete one note by id    |

## References from Hono Open API Starter Kit

- [What is Open API?](https://swagger.io/docs/specification/v3_0/about/)
- [Hono](https://hono.dev/)
  - [Zod OpenAPI Example](https://hono.dev/examples/zod-openapi)
  - [Testing](https://hono.dev/docs/guides/testing)
  - [Testing Helper](https://hono.dev/docs/helpers/testing)
- [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
- [Scalar Documentation](https://github.com/scalar/scalar/tree/main/?tab=readme-ov-file#documentation)
  - [Themes / Layout](https://github.com/scalar/scalar/blob/main/documentation/themes.md)
  - [Configuration](https://github.com/scalar/scalar/blob/main/documentation/configuration.md)
