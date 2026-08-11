# Life Report

A living resume ("life report card") platform for prolific polymaths: a public dossier of accomplishments (publications, treatises, software, patents, music) plus a private workspace to keep it current.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Frontend: `artifacts/life-report` (routes: `/` dossier, `/timeline`, `/manage`)
- API routes: `artifacts/api-server/src/routes/{profile,accomplishments,insights}.ts`
- DB schema: `lib/db/src/schema/{profile,accomplishments}.ts`
- API contract: `lib/api-spec/openapi.yaml`
- Theme: `artifacts/life-report/src/index.css` (archival/editorial: cream, ink black, crimson; Instrument Serif + Plus Jakarta Sans + Space Mono)

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The codegen script sed-rewrites the generated zod import to `zod/v4` (Orval v8 emits Zod v4 syntax like `zod.int()`). Don't remove that sed step from `lib/api-spec/package.json`.
- API responses validate Drizzle Date fields against string schemas — serialize dates to ISO strings (`serializeAccomplishment` in `artifacts/api-server/src/lib/serialize.ts`) before `.parse()`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
