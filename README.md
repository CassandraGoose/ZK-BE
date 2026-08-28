# ZK - Zettlekasten API

ZK is a decoupled, full-stack Zettlekasten note application.

Find out more about Zettlekasten [here](https://en.wikipedia.org/wiki/Zettelkasten)

This project was built to give me a solid review of Angular and a chance to work with Hono (see backend [here](https://github.com/CassandraGoose/ZK-BE)), as well as get practice working with various Application Security processes. 

See the project board [here](https://github.com/users/CassandraGoose/projects/4)

## Front-end Tech 

- Node.js
- Hono
- Zod
- Stoker
- Drizzle
- PostgreSQL
- Pino
- AWS-JWT-Verifier
- ESLint / Prettier

## Security Considerations

- [Threat Model](https://github.com/CassandraGoose/ZK-FE/blob/main/docs/ZK%20Full%20Stack%20Thread%20Model%20Document.pdf)
- SAST with Semgrep in the CI pipeline
- Coming Soon: GitLeaks, Dependabot, Security Report, Session Management Writeup, SDLC Report, DAST, OWASP ASVS Checklist Report

(Built with W3CJ's Hono Open API Starter Kit - A starter template for building fully documented type-safe JSON APIs with Hono and Open API.)

---


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
