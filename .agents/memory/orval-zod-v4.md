---
name: Orval + Zod v4 codegen fix
description: Why the api-spec codegen script rewrites the generated zod import
---

Orval v8 emits Zod v4 syntax (`zod.int()`), but the workspace catalog pins zod 3.25.x whose top-level `zod` import is the v3 API. The codegen script in `lib/api-spec/package.json` sed-rewrites the generated import to `zod/v4` after running orval.

**Why:** Without it, `pnpm run typecheck:libs` fails with `Property 'int' does not exist` right after codegen.

**How to apply:** Keep the sed step whenever the codegen script is touched; the fix must re-run after every codegen because the file is regenerated with `clean: true`.

Related: API routes must serialize Drizzle `Date` columns to ISO strings before parsing with the generated response schemas (they expect plain strings).
