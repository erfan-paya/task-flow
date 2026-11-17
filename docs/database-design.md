# TaskFlow — Database Design

## 1. Overview

TaskFlow uses PostgreSQL with Prisma ORM. The schema is relational and uses explicit foreign keys, unique constraints, indexes, and referential actions to protect data integrity.

The current schema contains five models:

- `User`
- `Project`
- `ProjectMember`
- `Task`
- `Category`
- `TaskAssignment`

It also defines the enums `ProjectRole`, `TaskStatus`, and `TaskPriority`.

## 2. Entities

### User

Stores account identity and authentication data.

| Field | Purpose |
| --- | --- |
| `id` | UUID primary key |
| `name` | User's display name |
| `email` | Unique, lowercase email address |
| `password` | Password hash; never store plaintext |
| `createdAt`, `updatedAt` | Timestamps |

### Project

Represents a workspace owned by one user.

| Field | Purpose |
| --- | --- |
| `id` | UUID primary key |
| `name` | Project name |
| `description` | Optional description |
| `ownerId` | Required reference to the owning user |
| `createdAt`, `updatedAt` | Timestamps |

### ProjectMember

Join entity connecting users to projects and recording their role.

| Field | Purpose |
| --- | --- |
| `id` | UUID primary key |
| `userId` | Project member |
| `projectId` | Project |
| `role` | `OWNER`, `ADMIN`, or `MEMBER` |
| `joinedAt` | Membership creation time |

The pair `(userId, projectId)` is unique, so a user cannot have duplicate membership records in one project.

### Task

Represents work inside exactly one project.

| Field | Purpose |
| --- | --- |
| `id` | UUID primary key |
| `title` | Required task title |
| `description` | Optional task description |
| `status` | Task lifecycle status; defaults to `TODO` |
| `priority` | Task priority; defaults to `MEDIUM` |
| `projectId` | Required project reference |
| `categoryId` | Optional category reference |
| `createdAt`, `updatedAt` | Timestamps |

The unique pair `(id, projectId)` supports the composite foreign key used by task assignments.

### Category

Represents a project-specific task classification.

| Field | Purpose |
| --- | --- |
| `id` | UUID primary key |
| `name` | Category name |
| `projectId` | Required owning project |
| `createdAt`, `updatedAt` | Timestamps |

Category names are unique per project without regard to case. This is enforced by a PostgreSQL expression index on `(projectId, LOWER(name))`, maintained in a SQL migration.

### TaskAssignment

Join entity connecting tasks to project members. It also records assignment metadata.

| Field | Purpose |
| --- | --- |
| `id` | UUID primary key |
| `taskId` | Assigned task |
| `userId` | Assigned user |
| `projectId` | Shared project key used by both composite foreign keys |
| `assignedAt` | Assignment timestamp |
| `assignedBy` | Optional user who created the assignment |

The unique pair `(taskId, userId)` prevents duplicate assignments to the same task.

## 3. Relationships

- **User → Project:** one user can own many projects; each project has exactly one owner.
- **User ↔ Project:** many-to-many through `ProjectMember`.
- **Project → Task:** one project has many tasks; each task belongs to one project.
- **Project → Category:** one project has many categories; each category belongs to one project.
- **Category → Task:** one category can be referenced by many tasks; a task's category is optional.
- **Task ↔ User:** many-to-many through `TaskAssignment`, constrained so the assigned user is a member of the task's project.
- **User → TaskAssignment creator:** a user can create many assignments; the creator reference is optional.

Comments are not part of the current model.

## 4. Integrity constraints

### Unique constraints and indexes

| Constraint / index | Purpose |
| --- | --- |
| Unique `User.email` | Prevent duplicate accounts |
| Check `User.email = LOWER(User.email)` | Keep stored email addresses lowercase |
| Unique `ProjectMember(userId, projectId)` | One membership per user and project |
| Index `ProjectMember(projectId)` | Efficiently list members of a project |
| Index `Project(ownerId)` | Efficiently list projects owned by a user |
| Unique `Task(id, projectId)` | Target for the task-assignment composite foreign key |
| Index `Task(projectId)` | Efficiently list tasks in a project |
| Unique `Category(id, projectId)` | Target for the task-category composite foreign key |
| Unique expression index `Category(projectId, LOWER(name))` | Case-insensitive category-name uniqueness within a project |
| Unique `TaskAssignment(taskId, userId)` | Prevent duplicate task assignments |
| Index `TaskAssignment(userId, projectId)` | Support lookup of a user's assignments in a project |

### Composite foreign keys

The task-category relation references `Category(id, projectId)` from `Task(categoryId, projectId)`. This prevents a task from referencing a category owned by another project.

The task-assignment relation references both:

- `Task(id, projectId)`
- `ProjectMember(userId, projectId)`

This ensures an assignment connects a task to a member of that same project.

## 5. Referential actions

| Relationship | On delete | Reason |
| --- | --- | --- |
| Project → owner User | Restrict | A user cannot be deleted while they own a project |
| ProjectMember → User | Cascade | Remove memberships when a non-owner user is deleted |
| ProjectMember → Project | Cascade | Remove memberships when a project is deleted |
| Task → Project | Cascade | A project's tasks are removed with the project |
| Category → Project | Cascade | A project's categories are removed with the project |
| Task → Category | Restrict | Category deletion must first clear task references transactionally |
| TaskAssignment → Task | Cascade | Remove assignments when a task is deleted |
| TaskAssignment → ProjectMember | Cascade | Remove assignments when membership is removed |
| TaskAssignment → assignment creator User | Set null | Preserve assignment history if its creator is deleted |

Database cascades provide referential cleanup. They do not replace application authorization. For example, the service must verify that the requester is the project owner before deleting a project.

## 6. Application-enforced invariants

Some business rules cannot be expressed by the current schema alone and must be enforced in application services:

- Creating a project and its owner's `ProjectMember` record with role `OWNER` must happen in one transaction.
- The owner membership must not be removed or demoted independently of a valid ownership transfer.
- Only the project owner may delete a project.
- Category deletion must first set `Task.categoryId` to null for affected tasks, then delete the category, in one transaction.
- A user must be authorized to access a project before reading or modifying its resources.

## 7. Migration notes and database validation

Prisma schema changes are managed through committed migrations in `prisma/migrations`. Review generated SQL before applying migrations, especially when a migration adds or changes foreign keys, indexes, or deletion behavior.

The current migrations explicitly add the lowercase email check and case-insensitive category-name expression index. The agreed non-empty-name checks for user names, project names, task titles, and category names are not yet present in the checked-in migrations; add and apply a migration before treating those database checks as implemented.

The database model should evolve with requirements. Add indexes when query patterns justify them rather than indexing every possible filter preemptively.
