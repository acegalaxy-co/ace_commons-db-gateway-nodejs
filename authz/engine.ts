"use strict";

const NAMING_REGEX = /^[a-z][a-z0-9_]*$/; // snake_case enforcement

/**
 * Check a QueryRequest against schema + authz policy.
 */
async function check(
  caller: import("../types").Caller,
  request: import("../types").QueryRequest
): Promise<{ allow: boolean; reason?: string }> {
  if (!request || !request.store || !request.op || !request.table) {
    return { allow: false, reason: "L3_schema" };
  }

  // Naming convention — applies to postgres + sqlite. Notion uses database_id (UUID).
  if (request.store !== "notion" && !NAMING_REGEX.test(request.table)) {
    return { allow: false, reason: "L3_schema" };
  }
  if (Array.isArray(request.columns)) {
    for (const col of request.columns) {
      if (!NAMING_REGEX.test(col)) return { allow: false, reason: "L3_schema" };
    }
  }

  // Notion hard-block on delete. Archive (op=archive, or op=update with data.archived=true) OK.
  // @ts-expect-error — TS migration: type unverified, fix when polishing
  if (request.store === "notion" && request.op === "delete") {
    return { allow: false, reason: "L3_notion_delete" };
  }

  // Phase 1: no per-table ACL yet. Phase 2 loads policies/<store>.yaml.
  // Phase 2 TODO: match caller.service + request.table + request.op against policy.

  return { allow: true };
}

export = { check };