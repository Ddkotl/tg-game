# Copilot Instructions (AI Agent)

---

## 1) Overview

RPG (Telegram Mini App first)

- Back: TS, NestJS
- Front: React (Vite), shadcn/ui
- DB: PostgreSQL (Docker)
- ORM: Prisma
- Tooling: pnpm, turborepo

---

## 2) Monorepo (STRICT)

**Only:** tooling, scripts, CI/CD. **No shared app logic.**

```
repo/
  apps/{back,front}
  package.json
  tsconfig.base.json
```

- ❌ front↔back imports, shared domain logic, Prisma in frontend
- ✅ shared configs/scripts; optional DTO-like types (no logic)

```
{ "scripts": { "dev": "turbo run dev", "build": "turbo run build", "lint": "turbo run lint", "test": "turbo run test" } }
```

- pnpm workspaces + turborepo; apps independent

---

## 3) Backend (NestJS)

```
feature/{*.module,*.controller,*.service,dto/,entities/,repository/}
```

- Controller: validation + delegate
- Service: business logic; ❌ no Prisma
- Repository: Prisma access
- DTO: class-validator, strict

---

## 4) Frontend (React)

```
src/{components,features,pages,hooks,lib}
```

- Typed props; no business logic in JSX
- Server: React Query; Local: useState/useReducer
- UI: shadcn/ui only

---

## 5) Game Rules

Domains: Player, Stats, Inventory, Combat, Quests

- Logic in backend; deterministic; zero-trust client

---

## 6) Auth

- MVP: Telegram WebApp (validate initData)
- Design extensible (email/OAuth later)

---

## 7) API

- REST, `/v1`

```
{ data: T, error: string | null }
```

---

## 8) DevOps

**Docker (MANDATORY)**: back, front, db; Dockerfile per app; docker-compose; `.env`; use service names (no localhost)

**CI (GitHub Actions)**: install → lint → build → test → docker-build; fail on error; pnpm cache

---

## 9) Prisma (STRICT)

**Scope**: backend-only (`apps/back`)

```
apps/back/prisma/schema.prisma
```

**Generator (LOCKED)**

```
generator client { provider = "prisma-client-js" }
```

- ❌ no `output` / custom paths

**Install**: only in `apps/back` (`prisma`, `@prisma/client`)

**Commands (ONLY)**

```
cd apps/back
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma migrate deploy
```

**Imports (ONLY)**

```ts
import { PrismaClient } from "@prisma/client";
```

- ❌ no relative/custom imports; no frontend usage

**Usage**: Repository only; Services/Controllers ❌ direct Prisma

**Types**: ❌ expose Prisma types; map to domain; DTOs for API

**Docker URL**

```
DATABASE_URL="postgresql://user:password@db:5432/app"
```

**Auto-fix (agent)**: reset generator → ensure path → reinstall deps → `prisma generate`

**Hard Stop**: sharing Prisma, frontend usage, custom output, running outside backend

---

## 10) OpenAPI / Swagger (MANDATORY)

- `@nestjs/swagger`; generate on boot
- DTOs annotated with `@ApiProperty`
- Docs: `/v1/docs` (JSON: `/v1/docs-json`)
- No `any`; consistent responses

---

## 11) Frontend API (Orval)

**Source**: backend OpenAPI

**Install (front)**

```
pnpm add -D orval
```

**Config** `apps/front/orval.config.ts`

```ts
import { defineConfig } from "orval";
export default defineConfig({
  api: {
    input: process.env.API_URL || "http://localhost:3000/v1/docs-json",
    output: {
      target: "./src/api/generated.ts",
      client: "react-query",
      schemas: "./src/api/model",
    },
  },
});
```

**Scripts (front)**

```
{
  "scripts": {
    "api:generate": "orval",
    "api:generate:watch": "orval --watch",
    "api:clean": "rm -rf src/api/generated.ts src/api/model",
    "api:regen": "pnpm api:clean && pnpm api:generate"
  }
}
```

**Root (optional)**

```
{ "scripts": { "api:generate": "pnpm --filter front api:generate", "api:regen": "pnpm --filter front api:regen" } }
```

**Rules**

- ❌ no manual API types; ❌ no Prisma in frontend
- Use generated hooks/clients only

**Workflow**: change DTOs → Swagger → `pnpm api:regen`

---

## 12) Git Hooks (Husky)

```
pnpm add -D husky
pnpm dlx husky-init
pnpm set-script prepare "husky" && pnpm install
```

`.husky/pre-commit`

```
pnpm api:regen
pnpm lint
pnpm test
```

- Commit fails if API/types outdated

---

## 13) CI: OpenAPI Sync Check

```
- name: Generate API types
  run: pnpm api:regen
- name: Check for changes
  run: |
    if [ -n "$(git status --porcelain)" ]; then
      echo "API types are outdated. Run pnpm api:regen"; exit 1; fi
```

---

## 14) Performance

- Avoid N+1; paginate; cache static

---

15. Testing (STRICT)
    General Strategy
    Goal: High confidence with low maintenance. Use AAA (Arrange, Act, Assert) pattern.
    Unit (Services): Focus on complex business logic and edge cases.
    Integration (Modules): Verify the "vertical slice" (Controller → Service → Repository → DB).
    Minimal Mocking: Prefer real dependencies. Use Testcontainers or a dedicated Docker DB for integration tests. Mock only external unstable APIs (Telegram Bot API, Payment Gateways).
    Backend (NestJS)
    Unit Tests (_.spec.ts):
    Test Services in isolation.
    Mock Repository using simple factory functions or jest.mock.
    Check: validation logic, math (stats/combat), and error triggers.
    Integration Tests (_.test.ts or \*.int-spec.ts):
    Use Test.createTestingModule to boot the actual module.
    Database: Use a real PostgreSQL instance (via Docker). Use a global teardown to truncate tables between tests.
    No Repository Mocking: Let the Service talk to the real Repository and Prisma.
    Coverage: 100% for Game Rules (Combat, Stats, Inventory).
    Frontend (React)
    Component Tests: Use React Testing Library.
    Test behavior, not implementation (e.g., "click button", not "check state").
    Hooks: Test React Query hooks using renderHook with a proper QueryClientProvider wrapper.
    Mocking API: Use MSW (Mock Service Worker) to intercept network requests. Do not manual-mock the generated.ts hooks.
    Tooling & Commands
    Framework: vitest (faster for monorepos) or jest.
    Execution:
    bash

# Run all tests via turbo

pnpm test

# Run only backend integration tests

pnpm --filter back test:int
Use code with caution.

Hard Rules
❌ No mocking of Prisma Client in integration tests.
❌ No logic testing in Controllers: Only status codes and response structures.
✅ Deterministic tests: Seed fixed data before running game-logic tests.
✅ Clean State: Every test must leave the database/store in its original state.

---

## 16) Git

- Conventional commits; small, atomic

---

## 17) AI Rules

**MUST NOT**: break architecture, large rewrites, silent breaking changes, duplicate logic
**SHOULD**: consistency, simple explicit code, document complex parts

---

## 18) DoD

- Compiles; types correct; lint passes; architecture respected

---

## 19) Priorities

1. Maintainability 2) Scalability 3) Clarity 4) Isolation

---

## 20) Anti-Patterns (HARD STOP)

- Business logic in frontend
- Shared domain logic
- Direct DB access outside repositories
- Hidden side effects; premature abstraction

---

**Note**: Design for independent scaling/splitting; avoid tech debt.
