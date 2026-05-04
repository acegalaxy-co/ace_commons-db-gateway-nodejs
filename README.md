# db-gateway/ — Framework reference

Reference skeleton + spec cho DB Gateway. Source of truth: [rules/db/01-db-gateway-mandatory.md](../rules/db/01-db-gateway-mandatory.md) + [docs/26-04-21-15h_db-gateway-plan.md](../docs/26-04-21-15h_db-gateway-plan.md).

## Status

**Phase 1 skeleton** (2026-04-21) — chưa production-ready. Pilot = nexus-one nodejs, `projects_repos/imba/ace_ace_nexus-one_nodejs/db-gateway/`.

## What it is

Thin, in-project module đứng trước mọi DAL/ORM. Funnel mọi DB access qua 5 layer default-deny trước khi chạm driver (PostgreSQL, SQLite, Notion).

## 5 layers → folder map

| Layer | Purpose                                      | Folder / file                                     |
| ----- | -------------------------------------------- | ------------------------------------------------- |
| L1    | Adapter (store-specific driver)              | `adapters/<store>.js` (postgres, sqlite, notion)  |
| L2    | Identity (caller service name + scope)       | `identity/resolver.js`                            |
| L3    | Schema contract + authz                      | `authz/engine.js` + `policies/*.yaml`             |
| L4    | Rate limit + connection pool                 | `rate-limit/limiter.js`                           |
| L5    | Audit log (append-only)                      | `audit/logger.js` → `audit/audit.log` (gitignored)|

Entry: `require('./db-gateway').query(request, caller)` — returns `{ outcome, denyReason, rows?, latencyMs }`. Never throws.

## Per-project independence

Framework KHÔNG ship shared lib. Mỗi project tự copy skeleton này vào `<project>/db-gateway/` và customize policy YAML riêng. Duplicate code OK — đổi lấy scope isolation.

## Policy YAML — single source of truth

`policies/schema.yaml` khai báo table/column/type + authz. Cả Node SDK và (future) JVM SDK đọc cùng file này.

## Cấm tuyệt đối

Xem [rules/db/01-db-gateway-mandatory.md](../rules/db/01-db-gateway-mandatory.md). Tóm tắt:

- ❌ Driver import ngoài `adapters/`.
- ❌ Bypass identity / authz / audit log.
- ❌ Hard DELETE trên table có soft_delete policy.
- ❌ `notion.pages.delete()` — archive-only.

## Sanity check (pre-commit)

```bash
grep -rn "require('pg')\|require('sqlite3')\|require('@notionhq/client')" . \
  --include="*.js" --include="*.ts" \
  --exclude-dir=db-gateway/adapters \
  --exclude-dir=node_modules
```

Must be empty once Phase 3 lands.
