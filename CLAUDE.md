---
description: deskcrew workspace guide (Bun + Turborepo). Read this before touching any package.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

# deskcrew

Bun + Turborepo monorepo. Every app and package is currently a skeleton — only `package.json`, `tsconfig.json`, and a one-line `src/index.ts` entry remain. All implementation has been wiped; build new features fresh.

## Workspace layout

```
apps/
├── agent-cli/    CLI / TUI agent runner (uses opentui)
├── cloud/        Cloud-side API (Bun.serve + Hono)
├── desktop/      Desktop driver (consumes agent-core)
└── web/          Next.js web client

packages/
├── agent-core/   Core agent / session logic, tool wiring
├── protocol/     Cross-package message + event shapes
├── types/        Shared TypeScript primitives
└── ui/           Shared UI primitives (React)
```

Cross-package deps flow inward: `apps/* → packages/*`, `packages/agent-core → packages/{protocol,types}`, `apps/web → packages/{ui,types,protocol}` (via Next `transpilePackages`).

## Current state

**Skeleton only.** Each `src/index.ts` is a stub that either prints `"not yet implemented"` (apps) or `export {}` (packages). `~/.deskcrew/` (config + sessions) is empty. `dist/`, `.turbo/`, `.next/` are all cleaned.

When implementing a feature, start from the relevant `src/index.ts` and grow outward. Don't reinstate prior architectural decisions without explicit need — the wipe was intentional.

## Commands

Run from repo root unless stated otherwise:

| Command | Effect |
|---------|--------|
| `bun install` | Install all workspace deps |
| `bun dev` | `turbo run dev` — start every app's dev script in parallel |
| `bun typecheck` | `turbo run typecheck` across the graph |
| `bun build` | `turbo run build` across the graph |
| `bun clean` | `turbo run clean` |
| `bun test` | Run `bun test` (per-package; only `agent-core` typically has tests) |

Per-package: `bun run <script>` inside the package dir, or `bunx turbo run <task> --filter=@deskcrew/<name>` from root.

`turbo.json` rules: `dev` depends on `^build` (deps must build first), `build`/`typecheck` cache outputs, `dev` is persistent + uncached.

## Runtime rules — Bun, not Node

- `bun <file>` instead of `node` / `ts-node`
- `bun test` instead of `jest` / `vitest`
- `bun build <file>` instead of `webpack` / `esbuild` / `vite`
- `bun install` / `bun run` instead of `npm` / `yarn` / `pnpm`
- Bun auto-loads `.env`, don't add `dotenv`

### Bun APIs to prefer

- `Bun.serve()` for HTTP / WS / HTTPS (don't use `express`)
- `bun:sqlite` for SQLite (don't use `better-sqlite3`)
- `Bun.redis` for Redis (don't use `ioredis`)
- `Bun.sql` for Postgres (don't use `pg` / `postgres.js`)
- `WebSocket` is built-in (don't use `ws`)
- `Bun.file` over `node:fs` readFile/writeFile
- `` Bun.$`ls` `` over `execa`

### Testing

```ts
// some-feature.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend conventions

- `apps/web` uses **Next.js 16 (App Router)** — server-rendered, transpiles workspace packages via `next.config.ts`'s `transpilePackages`.
- `apps/agent-cli` uses **opentui/solid** for the terminal UI (preloaded via `bunfig.toml`).
- For one-off Bun-served HTML apps (not the case here today), use HTML imports with `Bun.serve()`:

  ```ts
  import index from "./index.html";
  Bun.serve({ routes: { "/": index } });
  ```

  HTML files can import `.tsx`/`.css` directly; Bun's bundler handles transpilation + CSS bundling automatically.

## When in doubt

- Don't reinstall heavy deps "just in case" — the skeleton intentionally has minimal surface area.
- Check `node_modules/bun-types/docs/**.md` for Bun API specifics.
- The previous implementation (camofox browser tools, MCP wiring, session manager, TUI) was deleted by user request; rebuild only what's asked for.
