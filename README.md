# @kanelr/db-gateway

[![npm version](https://img.shields.io/npm/v/@acegalaxy%2Fdb-gateway.svg)](https://www.npmjs.com/package/@kanelr/db-gateway)
[![npm downloads](https://img.shields.io/npm/dm/@acegalaxy%2Fdb-gateway.svg)](https://www.npmjs.com/package/@kanelr/db-gateway)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/node/v/@acegalaxy%2Fdb-gateway.svg)](https://nodejs.org)


Multi-database adapter with a 5-layer default-deny security gateway for
PostgreSQL, SQLite, and Notion. Funnel every DB call through one entry point
with identity, policy authz, rate-limit, and append-only audit log.

## Why

Ad-hoc DB calls scattered across a codebase are impossible to audit and easy to
abuse. `db-gateway` centralizes access so every query passes the same checks:

- **Who** is calling (identity resolution)
- **What** they may touch (policy YAML, per-table/column)
- **How fast** they may call (rate-limit / pool)
- **What happened** (append-only audit log)

The gateway never throws; it returns `{ outcome, denyReason, rows?, latencyMs }`.

## Install

```bash
npm install @kanelr/db-gateway
```

Requires Node.js >= 20.

## Quick start

### PostgreSQL

```js
const { Gateway } = require('@kanelr/db-gateway');

const gw = Gateway.create({
  adapter: 'postgres',
  connection: { host: 'localhost', database: 'app', user: 'app' },
  policyPath: './policies/schema.yaml',
  identity: (ctx) => ({ service: ctx.service, scope: ctx.scope }),
  audit: (entry) => console.log(JSON.stringify(entry)),
});

const res = await gw.query(
  { op: 'select', table: 'users', where: { id: 42 } },
  { service: 'web-api', scope: 'read' },
);
// { outcome: 'allow', rows: [...], latencyMs: 3 }
```

### Notion

```js
const gw = Gateway.create({
  adapter: 'notion',
  connection: { token: process.env.NOTION_TOKEN },
  policyPath: './policies/notion.yaml',
  identity: (ctx) => ctx,
  audit: writeAuditLog,
});

const res = await gw.query(
  { op: 'page.update', pageId: 'abc...', props: { Status: 'Done' } },
  { service: 'sync-bot', scope: 'write' },
);
```

## Adapters

| Adapter    | Driver                | Status |
| ---------- | --------------------- | ------ |
| `postgres` | `pg`                  | beta   |
| `sqlite`   | `better-sqlite3`      | beta   |
| `notion`   | `@notionhq/client`    | beta   |

## Security layers

```
Caller
  │
  ▼
[L2] Identity resolver       ── who is this caller?
  │
  ▼
[L3] Policy authz (YAML)     ── may they touch this table/column?
  │
  ▼
[L4] Rate-limit + pool       ── too many calls? back off.
  │
  ▼
[L5] Audit log (append-only) ── record outcome + latency
  │
  ▼
[L1] Adapter (driver call)   ── only place that imports pg / sqlite / notion
```

Default-deny: missing policy entry = `deny`. Hard `DELETE` is blocked on tables
with `soft_delete` policy. `notion.pages.delete()` is never called — archive only.

## License

[MIT](./LICENSE) © 2026 ACE Galaxy

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
Security issues: see [SECURITY.md](./SECURITY.md).
