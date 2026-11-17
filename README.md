# TaskFlow

TaskFlow is a task management REST API built with Node.js, TypeScript, Express, PostgreSQL, and Prisma.

The project is being developed incrementally as a backend engineering practice project. The current foundation includes the Express application, environment configuration, PostgreSQL setup, Prisma schema and migrations, request validation, and centralized error handling. Business endpoints are not implemented yet.

## Technology stack

- Node.js
- TypeScript
- Express 5
- PostgreSQL 16
- Prisma ORM 7 with the PostgreSQL driver adapter
- Zod for request validation
- pnpm for package management
- Docker Compose for local PostgreSQL

## Prerequisites

Install the following:

- Node.js (the project was developed with Node.js 26)
- pnpm 12
- Docker Engine and Docker Compose

## Getting started

1. Clone the repository and enter the project directory.

   ```bash
   git clone https://github.com/erfan-paya/task-flow.git
   cd task-flow
   ```

2. Install dependencies.

   ```bash
   pnpm install
   ```

3. Create your local environment file.

   ```bash
   cp .env.example .env
   ```

   Update the values in `.env`. Use a strong local database password and make sure the credentials in `DATABASE_URL` match the PostgreSQL variables. URL-encode special characters in the database password when placing it in the connection URL.

4. Start PostgreSQL.

   ```bash
   docker compose up -d database
   ```

5. Apply database migrations and generate the Prisma client.

   ```bash
   pnpm exec prisma migrate dev
   pnpm exec prisma generate
   ```

6. Start the development server.

   ```bash
   pnpm dev
   ```

The API listens on the configured `PORT` (default: `3000`). The health endpoint is available at `GET /health`.

## Environment variables

| Variable | Description |
| --- | --- |
| `PORT` | HTTP server port |
| `POSTGRES_USER` | PostgreSQL user used by Docker Compose |
| `POSTGRES_PASSWORD` | PostgreSQL password used by Docker Compose |
| `POSTGRES_DB` | PostgreSQL database name |
| `POSTGRES_PORT` | Host port mapped to PostgreSQL port 5432 |
| `DATABASE_URL` | Connection URL used by the application and Prisma |

Never commit the real `.env` file. The `.env.example` file contains placeholders for local setup.

## Available scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run the API in watch mode |
| `pnpm build` | Compile TypeScript and rewrite path aliases |
| `pnpm start` | Run the compiled application |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Automatically fix supported ESLint issues |
| `pnpm format` | Format files with Prettier |
| `pnpm format:check` | Check formatting |
| `pnpm typecheck` | Run TypeScript without emitting files |
| `pnpm exec prisma migrate dev` | Create/apply a development migration |
| `pnpm exec prisma generate` | Generate the Prisma client |
| `pnpm exec prisma validate` | Validate the Prisma schema |

## Project structure

The application uses a feature-oriented modular structure. Shared infrastructure lives outside feature modules; business functionality is grouped by domain.

```text
src/
├── config/
├── database/
├── middlewares/
├── modules/
│   ├── users/
│   ├── projects/
│   ├── tasks/
│   ├── categories/
│   └── health/
├── utils/
├── app.ts
└── server.ts

prisma/
├── migrations/
└── schema.prisma

docs/
├── requirements.md
├── database-design.md
└── architecture.md
```

Feature directories are introduced as their functionality is implemented; not every directory necessarily contains completed endpoints yet.

## API status

The current API foundation includes a database-backed health check and shared middleware for request validation, not-found handling, and centralized errors. User registration, authentication, project management, task management, categories, and assignments remain implementation work.

## Documentation

- [Product requirements](docs/requirements.md)
- [Database design](docs/database-design.md)
- [Architecture](docs/architecture.md)

## Scope note

Comments are intentionally excluded from the current TaskFlow scope. They may be reconsidered later, but they are not part of the current database model or implementation roadmap.
