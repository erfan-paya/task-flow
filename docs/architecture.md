# TaskFlow — Architecture

## 1. Architectural approach

TaskFlow uses a feature-based modular architecture with separation between HTTP concerns, business rules, validation, and persistence.

The goal is to keep related functionality together without introducing abstractions that do not yet provide value. A repository layer is optional: use one when it meaningfully encapsulates reusable or complex database access, not as a mandatory wrapper around every Prisma call.

## 2. Current structure

The implemented application currently includes authentication and user modules, shared infrastructure, and the health module. Projects, categories, tasks, and assignment APIs are planned but not yet implemented.

```text
src/
├── config/
│   ├── auth.ts
│   └── env.ts
├── database/
│   └── prisma.ts
├── middlewares/
│   ├── auth.middleware.ts
│   ├── cors.middleware.ts
│   ├── csrf.middleware.ts
│   ├── error.middleware.ts
│   ├── login-rate-limit.middleware.ts
│   ├── not-found.middleware.ts
│   ├── security-headers.middleware.ts
│   └── validate.middleware.ts
├── modules/
│   ├── auth/
│   │   ├── auth.route.ts
│   │   ├── auth.controller.ts
│   │   └── auth.service.ts
│   ├── users/
│   │   ├── user.route.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.validation.ts
│   └── health/
├── utils/
│   ├── app-error.ts
│   ├── csrf.ts
│   ├── jwt.ts
│   ├── password.ts
│   └── refresh-token.ts
├── app.ts
└── server.ts
```

Add files only when a feature needs them. Do not create empty layers to match a template.

## 3. Responsibilities

### Routes
- Define HTTP methods and endpoint paths.
- Attach validation and authentication/authorization middleware.
- Delegate request handling to controllers.
- Avoid business logic and direct database access.

### Controllers
- Read validated request data and relevant route parameters.
- Call the appropriate service.
- Translate service results into HTTP status codes and response bodies.
- Avoid embedding business rules or complex Prisma queries.

### Services
- Implement business rules and coordinate use cases.
- Enforce authorization decisions that depend on domain data.
- Use Prisma transactions for multi-step operations that must succeed or fail together.
- Throw application errors for expected failure cases.

### Validation
- Define Zod schemas for request bodies and, when needed, route parameters and query strings.
- Normalize safe input at the boundary where appropriate.
- Keep validation separate from authorization and business rules.

### Repositories
- Encapsulate database queries when query complexity, reuse, or isolation justifies it.
- Do not add a repository for every model by default.

### Shared infrastructure
- `config`: validated environment and authentication configuration.
- `database`: Prisma client and database setup.
- `middlewares`: request validation, authentication, CSRF, CORS, login throttling, security headers, not-found handling, and error handling.
- `utils`: shared application errors, token helpers, and password helpers.

## 4. Request lifecycle

1. Express receives the request.
2. Route-level middleware validates input and authenticates/authorizes the requester when required.
3. The controller calls a service.
4. The service applies business rules and uses Prisma for persistence, optionally through a repository.
5. The controller sends the HTTP response.
6. Errors are forwarded to centralized error middleware.

The not-found middleware handles unmatched routes. The error middleware handles application errors and unexpected failures, returning client-safe responses without leaking internal details. Authentication and CSRF failures are represented as application errors and handled centrally. CORS, baseline security headers, a 16 KB JSON body limit, and login rate limiting are applied at the HTTP boundary.

## 5. Authentication architecture

- Access credentials are short-lived JWTs signed with HS256 and sent in the `Authorization: Bearer` header.
- Refresh credentials are opaque random tokens. Only their SHA-256 hashes are stored in PostgreSQL.
- Refresh tokens are rotated when used. Tokens in a family share a family identifier; reuse of a revoked token revokes remaining active tokens in that family.
- Refresh tokens are delivered in an HttpOnly cookie.
- Refresh and logout requests require a signed double-submit CSRF token.
- JWT and CSRF secrets are separate environment variables.
- See [Authentication](authentication.md) for the full lifecycle and endpoint details.

## 6. Application and server lifecycle

- `app.ts` configures Express, shared middleware, and routers.
- `server.ts` establishes database connectivity before accepting HTTP traffic.
- The server handles termination signals and closes the HTTP server and Prisma connection during shutdown.
- Environment values are loaded and validated in the configuration module.

## 7. API conventions

- Use a versioned API prefix for business endpoints: `/api/v1`.
- Use resource-oriented REST paths and appropriate HTTP methods.
- Return appropriate status codes: 201 for creation, 200 for successful reads/updates, 204 for successful operations with no body, 400 for invalid input, 401 for unauthenticated requests, 403 for forbidden actions, 404 for missing resources, 409 for conflicts, and 500 for unexpected server errors.
- Keep response shapes consistent across modules.
- Never return password hashes or internal exception details.
- Keep health checks separate from versioned business routes where appropriate.

The current health endpoint is `GET /health`; business routes are under `/api/v1`.

## 8. Transactions and integrity

Use database transactions when multiple writes represent one business operation. Examples include:

- Creating a project and its owner membership atomically.
- Clearing task category references and deleting a category atomically.
- Transferring project ownership while updating the owner membership consistently.
- Rotating refresh tokens by consuming the previous token and creating its replacement atomically.

Use database foreign keys and unique constraints as the final protection for relational invariants. Application authorization must still be checked explicitly.

## 9. Verification approach

Features are currently verified through manual API testing and code review. For authentication, manually verify registration, login, invalid credentials, missing/invalid/expired access tokens, refresh-token rotation, reuse detection, logout, and CSRF rejection cases. Record the tested scenarios and observed results in the project notes when useful.

## 10. Evolution principles

- Implement one feature at a time.
- Keep modules cohesive and dependencies explicit.
- Avoid premature abstractions and unnecessary layers.
- Add indexes based on query patterns.
- Document meaningful architecture decisions when they affect future work.
- Do not implement out-of-scope features without revisiting product requirements.
