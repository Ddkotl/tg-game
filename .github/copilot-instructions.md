# GitHub Copilot Instructions for AI Agent Development

---

## 1. Project Overview

Text-based RPG (browser-style) delivered initially via **Telegram Mini App**, with planned expansion to additional platforms and authentication methods.

### Tech Stack

* **Backend:** TypeScript, NestJS
* **Frontend:** React (Vite)
* **UI:** shadcn/ui
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Tooling:** pnpm, turborepo

---

## 2. Monorepo Strategy (STRICT)

### Purpose

The monorepo exists ONLY for:

* unified tooling
* shared scripts
* CI/CD consistency

It is **NOT** used for sharing application logic.

---

### 2.1 Structure

```
repo/
  apps/
    back/        # NestJS backend (isolated)
    front/       # React frontend (isolated)
  package.json
  tsconfig.base.json
```

---

### 2.2 Isolation Rules (CRITICAL)

#### ❌ Forbidden

* Importing backend code into frontend
* Importing frontend code into backend
* Sharing business logic between apps
* Using Prisma models/types in frontend

#### ✅ Allowed

* Shared configs (tsconfig, eslint, prettier)
* Shared scripts
* Optional shared types ONLY IF:

  * transport-level (DTO-like)
  * no business logic
  * no dependency on backend internals

> If unsure → DO NOT SHARE

---

### 2.3 Root Configuration

#### package.json

```
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test"
  }
}
```

#### Requirements

* pnpm workspaces
* turborepo orchestration
* apps must be independently buildable and deployable

---

## 3. Backend Architecture (NestJS)

### 3.1 Principles

* Modular (feature-based)
* Layered separation
* Business logic isolated in services

### 3.2 Structure

```
feature/
  feature.module.ts
  feature.controller.ts
  feature.service.ts
  dto/
  entities/
  repository/
```

### 3.3 Rules

#### Controllers

* No business logic
* Validation + delegation only

#### Services

* Contain all business logic
* Must NOT access Prisma directly

#### Repositories

* Wrap Prisma
* Return domain-safe data

#### Validation

* class-validator required
* strict DTOs

---

## 4. Frontend Architecture (React)

### 4.1 Principles

* Functional components only
* Clear separation of concerns

### 4.2 Structure

```
src/
  components/   # UI (dumb)
  features/     # logic
  pages/
  hooks/
  lib/
```

### 4.3 Rules

#### Components

* Fully typed props
* No business logic in JSX

#### State

* Server state → React Query
* Local state → useState / useReducer

#### UI

* shadcn/ui only
* No custom UI unless justified

---

## 5. Game Architecture

### Core Domains

* Player
* Stats
* Inventory
* Combat
* Quests

### Rules

* ALL logic in backend
* Frontend = renderer only
* Deterministic calculations
* Zero trust to client

---

## 6. Authentication

### MVP

* Telegram WebApp auth
* initData validation on backend

### Future

* Email/password
* OAuth providers

Design must be extensible from start.

---

## 7. API Design

### Style

* REST (initial)
* Versioned: `/v1`

### Response Format

```
{
  data: T,
  error: string | null
}
```

---

## 8. Infrastructure & DevOps (Docker + CI/CD)

### 8.1 Docker (MANDATORY)

All parts of the system MUST run in Docker containers.

#### Services

* backend (NestJS)
* frontend (React)
* database (PostgreSQL)

#### Requirements

* Each app must have its own `Dockerfile`
* Use `docker-compose` for local development
* Environment variables via `.env`

#### Example structure

```
repo/
  docker-compose.yml
  apps/
    back/
      Dockerfile
    front/
      Dockerfile
```

#### Rules

* Containers must be independently buildable
* No local machine dependencies
* Database must be dockerized (PostgreSQL)

---

### 8.2 Testing (REQUIRED)

#### Backend

* Unit tests for services
* Integration tests for modules

#### Frontend

* Component tests (basic level for MVP)

#### Rules

* Tests must run in CI
* Tests must not depend on local state

---

### 8.3 CI/CD (GitHub Actions)

CI/CD MUST be configured using GitHub Actions.

#### Required pipelines

1. **CI Pipeline** (on push / PR)

* install dependencies
* lint
* build
* run tests

2. **Docker Build Pipeline**

* build backend image
* build frontend image

#### Example jobs

* `lint`
* `build`
* `test`
* `docker-build`

#### Rules

* Pipeline must fail on any error
* No skipped tests
* Use caching where possible (pnpm cache)

---

## 9. Prisma Guidelines (STRICT ENFORCEMENT)

This section defines **non-negotiable rules** for Prisma usage. The AI agent MUST follow them exactly.

---

### 9.1 Scope

* Prisma is **backend-only**
* Location: `apps/back`
* NEVER used in frontend

---

### 9.2 File Structure (MANDATORY)

```
apps/back/
  prisma/
    schema.prisma
```

* No alternative locations
* No duplication

---

### 9.3 Generator (LOCKED CONFIG)

The generator MUST be EXACTLY:

```
generator client {
  provider = "prisma-client-js"
}
```

#### ❌ STRICTLY FORBIDDEN

* `output` field
* custom paths
* multiple generators

---

### 9.4 Installation Rules

Prisma MUST be installed ONLY in backend:

* `apps/back/package.json` contains:

  * `prisma`
  * `@prisma/client`

#### ❌ FORBIDDEN

* installing prisma in root
* installing prisma in frontend

---

### 9.5 Generation Rules

Commands MUST be executed ONLY from backend directory:

```
cd apps/back
pnpm prisma generate
```

#### ❌ FORBIDDEN

* running prisma from root
* running prisma from frontend

---

### 9.6 Import Rules (STRICT)

#### ✅ ONLY VALID IMPORT

```ts
import { PrismaClient } from '@prisma/client'
```

#### ❌ FORBIDDEN

* relative imports to generated client
* custom paths
* imports from `prisma/generated`

---

### 9.7 Usage Boundaries

#### ✅ ALLOWED

* Repository layer ONLY

#### ❌ FORBIDDEN

* Controllers using Prisma
* Services using Prisma directly
* Frontend using Prisma

---

### 9.8 Type Usage Rules

Prisma types are **NOT domain models**.

#### ❌ FORBIDDEN

* returning Prisma types from services
* exposing Prisma types in API
* using Prisma types in frontend

#### ✅ REQUIRED

* map Prisma → Domain
* use DTOs in controllers

---

### 9.9 Docker Rules

* DB host MUST be service name (e.g. `db`)

Example:

```
DATABASE_URL="postgresql://user:password@db:5432/app"
```

#### ❌ FORBIDDEN

* localhost in docker

---

### 9.10 Failure Auto-Fix Rules (FOR AI AGENT)

If Prisma is broken, agent MUST:

1. Remove incorrect generator config
2. Remove custom output paths
3. Ensure correct location (`apps/back/prisma`)
4. Reinstall dependencies in backend
5. Run:

```
pnpm prisma generate
```

---

### 9.11 Absolute Prohibitions (HARD STOP)

* Sharing Prisma between apps
* Using Prisma in frontend
* Custom client output paths
* Running Prisma outside backend

If any of the above occurs → MUST BE FIXED IMMEDIATELY

---

### 9.1 Location & Structure

* Prisma MUST exist only in: `apps/back`
* Schema location:

```
apps/back/prisma/schema.prisma
```

* Generated client must use default location (`node_modules`)

---

### 9.2 Generator नियम (STRICT)

```
generator client {
  provider = "prisma-client-js"
}
```

#### ❌ Forbidden

* Custom output paths
* Generated clients outside node_modules

---

### 9.3 Import Rules

#### ✅ Allowed (backend only)

```ts
import { PrismaClient } from '@prisma/client'
```

#### ❌ Forbidden

* Relative imports to generated client
* Sharing Prisma client across apps
* Using Prisma in frontend

---

### 9.4 Architecture Separation

Prisma types MUST NOT be used as domain models.

#### ❌ Forbidden

* Using Prisma models in business logic
* Exposing Prisma types in API

#### ✅ Required

* Map Prisma → Domain models
* Use DTOs for API layer

---

### 9.5 Usage Pattern

* Prisma only inside Repository layer
* Services MUST NOT access Prisma directly

---

### 9.6 Commands

All Prisma commands MUST be executed from backend:

```
cd apps/back
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma migrate deploy
```

---

### 9.7 Docker Integration

* Database must be accessible via service name (not localhost)
* Example:

```
DATABASE_URL="postgresql://user:password@db:5432/app"
```

---

### 9.8 Common Failure Cases (Prevent)

* Missing `prisma generate`
* Broken node_modules
* Wrong working directory
* Custom generator output

AI agent MUST fix these automatically if detected.

---

## 10. Performance Rules

* Avoid N+1 queries
* Always paginate
* Cache static data

---

## 11. Testing Strategy

* Unit tests → services
* Integration tests → modules
* Avoid excessive Prisma mocking

---

## 12. Git Workflow

### Commits

* feat:
* fix:
* refactor:
* chore:

### Rules

* Small commits
* Atomic changes

---

## 13. AI Agent Rules

### MUST NOT

* Rewrite large code sections without request
* Introduce breaking changes silently
* Violate architecture boundaries
* Duplicate logic

### SHOULD

* Suggest improvements
* Maintain consistency
* Refactor when beneficial
* Document complex logic

---

## 14. Definition of Done

A task is complete when:

* Code compiles
* Types are correct
* Lint passes
* Logic is correct
* Architecture rules respected

---

## 15. Engineering Priorities

Always prioritize:

1. Maintainability
2. Scalability
3. Clarity
4. Isolation of concerns

---

## 16. Anti-Patterns (Hard Stop)

* Business logic in frontend
* Shared domain logic between apps
* Direct DB access outside repository layer
* Hidden side effects
* Over-abstraction early

---

## Final Note

This project is expected to evolve into a scalable multiplayer RPG system.

All decisions must preserve the ability to:

* split services
* scale independently
* evolve architecture without rewrites

Avoid shortcuts that create long-term technical debt.
