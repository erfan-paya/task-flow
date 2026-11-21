# TaskFlow

TaskFlow is a task management REST API built with Node.js, TypeScript, Express 5, PostgreSQL, and Prisma.

The project is developed incrementally as a backend engineering practice project. The current implementation includes the backend foundation, user registration and login, JWT authentication, refresh-token lifecycle management, CSRF protection, and a protected current-user endpoint. Project, membership, category, task, and assignment APIs remain future implementation work.

## Technology stack

- Node.js 26
- TypeScript
- Express 5
- PostgreSQL 16
- Prisma ORM 7 with the PostgreSQL driver adapter
- Zod for request validation
- Argon2id for password hashing
- jose for JWT signing and verification
- pnpm
- Docker Compose
- Biome for linting and formatting

## Prerequisites

- Node.js 26
- pnpm 12
- Docker Engine and Docker Compose

## Getting started

1. Clone the repository and install dependencies.

   ```bash
   git clone https://github.com/erfan-paya/task-flow.git
   cd task-flow
   pnpm install
   ```

2. Create your local environment file.

   ```bash
   cp .env.example .env
   ```

3. Generate independent secrets for JWT and CSRF:

   ```bash
   openssl rand -base64 32
   ```

   Generate a value for each secret separately. Set `JWT_SECRET` and `CSRF_SECRET` in `.env`; each must contain at least 32 bytes. Update the database credentials and make sure `DATABASE_URL` matches the PostgreSQL variables. URL-encode special characters in the database password in the connection URL.

4. Start PostgreSQL.

   ```bash
   docker compose up -d database
   ```

5. Apply migrations and generate the Prisma client.

   ```bash
   pnpm exec prisma migrate dev
   pnpm exec prisma generate
   ```

6. Start the development server.

   ```bash
   pnpm dev
   ```

The API listens on `PORT` (default: `3000`). The health endpoint is `GET /health`. JSON request bodies are limited to 16 KB.

## Environment variables

| Variable | Description |
| --- | --- |
| `PORT` | HTTP server port |
| `CORS_ORIGINS` | Comma-separated exact browser origins allowed to call the API (for example `http://localhost:3001`) |
| `POSTGRES_USER` | PostgreSQL user used by Docker Compose |
| `POSTGRES_PASSWORD` | PostgreSQL password used by Docker Compose |
| `POSTGRES_DB` | PostgreSQL database name |
| `POSTGRES_PORT` | Host port mapped to PostgreSQL port 5432 |
| `DATABASE_URL` | PostgreSQL connection URL |
| `JWT_SECRET` | Secret used to sign access JWTs (at least 32 bytes) |
| `CSRF_SECRET` | Independent secret used to sign CSRF tokens (at least 32 bytes) |

Never commit the real `.env` file or reuse production secrets in local development. Set `CORS_ORIGINS` to your actual frontend origin(s); use exact origins including scheme and port, with no trailing slash. Production should normally allow only the deployed frontend origin.

## Available scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run the API in watch mode |
| `pnpm build` | Compile TypeScript and rewrite path aliases |
| `pnpm start` | Run the compiled application |
| `pnpm lint` | Run Biome lint checks |
| `pnpm lint:fix` | Apply supported Biome lint fixes |
| `pnpm format` | Format files with Biome |
| `pnpm format:check` | Check formatting |
| `pnpm check` | Run Biome checks |
| `pnpm typecheck` | Run TypeScript without emitting files |

Prisma commands:

```bash
pnpm exec prisma migrate dev
pnpm exec prisma generate
pnpm exec prisma validate
```

## Implemented API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Database-backed health check |
| POST | `/api/v1/auth/register` | Register a user |
| POST | `/api/v1/auth/login` | Log in and issue access/refresh credentials |
| GET | `/api/v1/auth/csrf` | Issue a CSRF token cookie and token value |
| POST | `/api/v1/auth/refresh` | Rotate refresh token and issue a new access token |
| POST | `/api/v1/auth/logout` | Revoke the current refresh token |
| GET | `/api/v1/users/me` | Return the authenticated user's profile |

See [Authentication](docs/authentication.md) for the authentication lifecycle, cookie behavior, and request examples.

## Project structure

```text
src/
├── config/
├── database/
├── middlewares/
├── modules/
│   ├── auth/
│   ├── users/
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
├── architecture.md
└── authentication.md
```

Feature directories are introduced as functionality is implemented; not every planned domain currently has API endpoints.

## Documentation

- [Product requirements](docs/requirements.md)
- [Database design](docs/database-design.md)
- [Architecture](docs/architecture.md)
- [Authentication](docs/authentication.md)
- [Manual security verification](docs/manual-security-review.md)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).

## Scope note

Comments, notifications, attachments, real-time collaboration, and billing are outside the current TaskFlow scope.
