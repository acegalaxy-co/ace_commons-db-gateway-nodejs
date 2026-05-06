# @kanelr/db-gateway

> **NPM commons library** — Cross-project DB gateway: 5-layer default-deny (postgres/sqlite/notion) with policy YAML, audit log, rate limit, identity resolution.
> Cross-cutting rules: see framework `../../rules/00-index.md`.
> ⭐⭐⭐ **Harness Architecture (P0)**: Mọi feature mới BẮT BUỘC route qua 1 trong 5 surfaces (slash command / hook / subagent / MCP / permission). Đọc `../../rules/meta/02-harness-architecture.md`. KHÔNG add ad-hoc scripts.

## Module purpose

Project-agnostic gateway wrapping DB adapters with default-deny authz + audit. Consumers inject identity map + policy + audit sink callbacks; no global state.

## Key files

- `index.js` — entry point
- `adapters/` — postgres / sqlite / notion drivers
- `authz/`, `policies/` — default-deny + YAML policy
- `audit/`, `rate-limit/`, `identity/` — L5 forensics, L4 DoS guard, identity resolver
- `types.js` — shared types

## Embedded vs imported

Per gateway-mandatory rule: per-project independence — KHÔNG `require()` module này từ project khác. Copy code OK, scope isolation.

## Tests

`npm test` (runs `node --test test/`).
