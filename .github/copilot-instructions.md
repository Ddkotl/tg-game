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

## 8. Prisma Guidelines

* Explicit relations
* No implicit many-to-many
* Indexed frequent queries
* Transactions for critical flows

---

## 9. Performance Rules

* Avoid N+1 queries
* Always paginate
* Cache static data

---

## 10. Testing Strategy

* Unit tests → services
* Integration tests → modules
* Avoid excessive Prisma mocking

---

## 11. Git Workflow

### Commits

* feat:
* fix:
* refactor:
* chore:

### Rules

* Small commits
* Atomic changes

---

## 12. AI Agent Rules

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

## 13. Definition of Done

A task is complete when:

* Code compiles
* Types are correct
* Lint passes
* Logic is correct
* Architecture rules respected

---

## 14. Engineering Priorities

Always prioritize:

1. Maintainability
2. Scalability
3. Clarity
4. Isolation of concerns

---

## 15. Anti-Patterns (Hard Stop)

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
