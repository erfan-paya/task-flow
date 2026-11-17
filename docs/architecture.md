# TaskFlow — Architecture

## 1. Architectural approach

TaskFlow uses a feature-based modular architecture with separation between HTTP concerns, business rules, validation, and persistence.

The goal is to keep related functionality together without introducing abstractions that do not yet provide value. A repository layer is optional: use one when it meaningfully encapsulates reusable or complex database access, not as a mandatory wrapper around every Prisma call.

## 2. Current and intended structure

The current repository has shared infrastructure under `config`, `database`, `middlewares`, and `utils`. The health module and feature directories have been created; most business modules are still planned rather than implemented.

Intended structure as features are developed:

```text
src/
├── config/
│   └── env.ts
├── database/
│   └── prisma.ts
├── middlewares/
│   ├── error.middleware.ts
│   ├── not-found.middleware.ts
│   └── validate.middleware.ts
├── modules/
│   ├── users/
│   │   ├── user.route.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.validation.ts
│   ├── projects/
│   ├── tasks/
│   ├── categories/
│   └── health/
├── utils/
│   └── app-error.ts
├── app.ts
└── server.ts
```

A module should contain only the files it needs. Add controller, service, validation, and repository files as the feature requires them; do not create empty layers just to match a template.

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

- `config`: validated environment configuration.
- `database`: Prisma client and database setup.
- `middlewares`: request validation, not-found handling, error handling, and later authentication.
- `utils`: shared application errors and small cross-module utilities.

## 4. Request lifecycle

The intended request flow is:

1. Express receives the request.
2. Route-level middleware validates input and authenticates/authorizes the requester when required.
3. The controller calls a service.
4. The service applies business rules and uses Prisma for persistence, optionally through a repository.
5. The controller sends the HTTP response.
6. Errors are forwarded to centralized error middleware.

The not-found middleware handles unmatched routes. The error middleware handles application errors and unexpected failures, returning safe responses without leaking internal details.

## 5. Application and server lifecycle

- `app.ts` configures Express, shared middleware, and routers.
- `server.ts` establishes database connectivity before accepting HTTP traffic.
- The server handles termination signals and closes the HTTP server and Prisma connection during shutdown.
- Environment values are loaded and validated in the configuration module.

## 6. API conventions

- Use a versioned API prefix for business endpoints: `/api/v1`.
- Use resource-oriented REST paths and appropriate HTTP methods.
- Return appropriate status codes: for example, 201 for successful creation, 200 for successful reads/updates, 204 when a successful operation intentionally has no response body, 400 for invalid input, 401 for unauthenticated requests, 403 for forbidden actions, 404 for missing resources, 409 for conflicts, and 500 for unexpected server errors.
- Keep response shapes consistent across modules.
- Never return password hashes or internal exception details.
- Keep health checks separate from versioned business routes where appropriate.

The current health endpoint is `GET /health`; business routes will be added under `/api/v1`.

## 7. Transactions and integrity

Use database transactions when multiple writes represent one business operation. Initial examples include:

- Creating a project and its owner membership atomically.
- Clearing task category references and deleting a category atomically.
- Transferring project ownership while updating the owner membership consistently.

Use database foreign keys and unique constraints as the final protection for relational invariants. Application authorization must still be checked explicitly.

## 8. Testing strategy

As features are implemented, tests should cover:

- Validation success and failure cases.
- Service business rules and authorization boundaries.
- Database constraints and transactional behavior.
- HTTP status codes and response shapes.
- Error middleware behavior.
- Important deletion and membership edge cases.

Prefer tests that verify observable behavior. Keep tests independent and avoid relying on execution order.

## 9. Evolution principles

- Implement one feature at a time.
- Keep modules cohesive and dependencies explicit.
- Avoid premature abstractions and unnecessary layers.
- Add indexes based on query patterns.
- Document meaningful architecture decisions when they affect future work.
- Do not implement comments or other out-of-scope features without revisiting product requirements.
