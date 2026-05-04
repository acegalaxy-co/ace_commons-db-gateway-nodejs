"use strict";

/**
 * @typedef {Object} Caller
 * @property {string} service    service name (e.g. "nexus-invoice-collector")
 * @property {string} scope      scope identifier (e.g. "nexus", "framework", "devops")
 * @property {string[]} [roles]  optional role list for authz
 */
export interface Caller {
  service: string;
  scope: string;
  roles?: string[];
}

/**
 * @typedef {Object} QueryRequest
 * @property {"postgres"|"sqlite"|"notion"} store  target data store
 * @property {"read"|"write"|"archive"|"create"|"update"} op  operation type
 * @property {string} table          table name (postgres/sqlite) or database_id (notion)
 * @property {string[]} [columns]    columns touched (for schema validation)
 * @property {Object} [where]        filter predicate
 * @property {Object} [data]         payload for write/create/update
 * @property {string} [rawSql]       raw SQL (only for allowlisted services)
 */
export interface QueryRequest {
  store: "postgres" | "sqlite" | "notion";
  op: "read" | "write" | "archive" | "create" | "update";
  table: string;
  columns?: string[];
  where?: Record<string, unknown>;
  data?: Record<string, unknown>;
  rawSql?: string;
}

/**
 * @typedef {Object} OutcomeRecord
 * @property {string} ts              ISO timestamp
 * @property {string} store
 * @property {string} op
 * @property {string} table
 * @property {string} callerService
 * @property {string} callerScope
 * @property {"allow"|"deny"} outcome
 * @property {string|null} denyReason "L2_unknown_caller" | "L3_schema" | "L3_authz" |
 *                                     "L3_notion_delete" | "L4_rate_limit" | "L1_adapter"
 * @property {number} latencyMs
 * @property {number} [rowCount]      rows affected (on allow)
 */
export interface OutcomeRecord {
  ts: string;
  store: string;
  op: string;
  table: string;
  callerService: string;
  callerScope: string;
  outcome: "allow" | "deny";
  denyReason: "L2_unknown_caller" | "L3_schema" | "L3_authz" | "L3_notion_delete" | "L4_rate_limit" | "L1_adapter" | null;
  latencyMs: number;
  rowCount?: number;
}

// @ts-expect-error — TS migration: type unverified, fix when polishing
export = {};