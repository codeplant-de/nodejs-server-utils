# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Lerna monorepo of Node.js server utilities published under the `@codeplant-de` npm scope. npm workspaces with Volta-managed tooling (Node 22).

## Commands

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Test all packages
npm test

# Per-package commands (run from individual package directory)
npm test           # Jest tests
npm run build      # Build CJS + types
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
npm run format     # Prettier

# Run a single test file
cd middleware/request-logging && npx jest src/defaults/requestToMetaFormatter.test.ts
```

## Architecture

Two workspace roots: `packages/` (core libraries) and `middleware/` (Express/Connect middleware).

**Core packages:**
- `packages/logger` — Logger factory built on Pino. Exports `Logger`, `LogLevel`, `LogEntry` types.
- `packages/middleware` — Umbrella package that aggregates and re-exports the individual middleware packages below.

**Middleware packages** (each is a standalone Connect-compatible middleware):
- `middleware/http-context-provider` — AsyncLocalStorage-based per-request context (get/store values).
- `middleware/request-id-provider` — Generates UUID v4 request/correlation IDs; reads from/writes to headers.
- `middleware/logger-provider` — Attaches a logger instance (with optional child loggers) to each request.
- `middleware/request-logging` — Logs HTTP request/response with timing, configurable formatters and skip/level functions.
- `middleware/error-logging` — Error logging middleware.
- `middleware/apollo-server-logging` — Apollo Server v3 logging plugin.
- `middleware/apollo-server-v4-logging` — Apollo Server v4/v5 logging plugin with peer deps on `@apollo/server` and `graphql`.

**Dependency flow:** `nodejs-server-middleware` (umbrella) → individual middleware → `nodejs-server-logger` (core).

## Build & Package Conventions

- Each package builds to CJS (`build:cjs`) + type declarations (`build:types`).
- TypeScript config extends `@codeplant-de/typescript-config/node.tsconfig.json` with `moduleResolution: Node16`.
- ESLint extends `@codeplant-de/eslint-config/node.yml`. Prettier uses `@codeplant-de/prettier-config`.
- Lerna uses independent versioning.
- Tests use Jest with `ts-jest` and `babel-jest`; some packages use `tsd` for type-level tests (`test:types` script).
