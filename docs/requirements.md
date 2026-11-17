# TaskFlow — Product Requirements

## 1. Product overview

TaskFlow is a task management REST API for organizing work inside projects. A user can own projects, collaborate with other project members, organize work with categories, create tasks, and assign tasks to project members.

This document records the agreed initial product scope and business rules. It does not imply that all endpoints have already been implemented.

## 2. Scope

### In scope

- User accounts
- Projects and project ownership
- Project membership and roles
- Tasks with status and priority
- Project-specific categories
- Multiple task assignees
- Authentication and authorization
- Request validation and consistent error handling

### Out of scope for the current scope

- Comments
- Notifications
- Attachments and file uploads
- Real-time collaboration
- Billing or subscription management

These features can be considered separately if requirements change.

## 3. Functional requirements

### Users

- A user can register with a name, email, and password.
- Email addresses are normalized to lowercase and must be unique.
- Passwords must be stored as secure password hashes, never as plaintext.
- Public API responses must not expose password hashes.

### Projects

- A project has exactly one owner.
- A project can have multiple members.
- The owner is also represented in the project membership records with role `OWNER`.
- Project membership roles are `OWNER`, `ADMIN`, and `MEMBER`.
- A user can belong to a project only once.
- Only the project owner can delete the project. An admin cannot delete a project.
- Project creation must create the project and its owner membership atomically.

### Tasks

- Every task belongs to exactly one project.
- A task has a title, optional description, status, and priority.
- Task status values are `TODO`, `IN_PROGRESS`, `IN_REVIEW`, and `DONE`.
- Task priority values are `LOW`, `MEDIUM`, and `HIGH`.
- A task may optionally belong to one category.
- A task may be assigned to multiple users.
- Only members of the task's project may be assigned to that task.
- A user cannot be assigned to the same task more than once.

### Categories

- Categories belong to a project.
- Category names are unique within a project without regard to letter casing.
- A task's category, when present, must belong to the same project as the task.
- Deleting a category preserves its tasks and clears their category reference.

## 4. Authorization and business rules

- Project ownership is distinct from project membership, but the owner must also have a membership record with role `OWNER`.
- Only the owner may delete a project; project admins and members may not.
- Project membership is required for task assignment.
- Removing a project member removes that member's task assignments in the project.
- Project owner membership must not be removed or demoted without a valid ownership-transfer operation.
- Ownership transfer must keep the project owner and the `OWNER` membership record consistent.
- Authorization is enforced by application services and middleware; database foreign keys provide data integrity, not permission checks.

## 5. Deletion behavior

| Deleted record | Expected behavior |
| --- | --- |
| Project | Its tasks, categories, and project memberships are deleted; dependent task assignments are removed through their relationships. |
| Task | Its task assignments are deleted. |
| Category | Tasks remain and their category reference is cleared before category deletion. |
| Non-owner project member | Membership and that member's task assignments are deleted. |
| User who owns a project | Deletion is restricted until ownership is transferred or the owned project is deleted. |
| User referenced as assignment creator | Assignment remains and its `assignedBy` reference becomes null. |

The category deletion operation must clear task references and delete the category in one database transaction. Project deletion must be authorized by the application before relying on database cascades for cleanup.

## 6. Non-functional requirements

- **Maintainability:** use feature-based modules and clear separation of HTTP, business, and persistence responsibilities.
- **Type safety:** use TypeScript strict mode and typed Prisma operations.
- **Validation:** validate untrusted request input with Zod.
- **Security:** hash passwords, keep secrets out of source control, and enforce authentication and authorization before protected operations.
- **Data integrity:** use foreign keys, unique constraints, check constraints where appropriate, and transactions for multi-step invariants.
- **Reliability:** connect to PostgreSQL before accepting HTTP traffic and close resources during graceful shutdown.
- **Error handling:** return consistent client-safe errors and avoid exposing internal error details.
- **Performance:** add indexes based on expected access patterns and review query behavior as features are implemented.
- **Testability:** cover validation, business rules, authorization, database behavior, and HTTP responses with automated tests as the project grows.

## 7. Acceptance principles

A feature is not considered complete merely because its happy path works. It should also demonstrate validation, authorization, expected error responses, data integrity, and appropriate tests.

The current implementation status is tracked through the repository and project work; requirements in this document describe intended behavior, not a claim that all features are already available.
