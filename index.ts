"use strict";
const { resolveCaller } = require("./identity/resolver");
const authz = require("./authz/engine");
const limiter = require("./rate-limit/limiter");
const audit = require("./audit/logger");
const { QueryRequest, Caller, OutcomeRecord } = require("./types");

const _adapters: Map<string, any> = new Map();

function _getAdapter(store: string): any {
  if (_adapters.has(store)) return _adapters.get(store);
  let adapter: any;
  switch (store) {
    case "postgres":
      adapter = require("./adapters/postgres").create();
      break;
    case "sqlite":
      adapter = require("./adapters/sqlite").create();
      break;
    case "notion":
      adapter = require("./adapters/notion").create();
      break;
    default:
      return null;
  }
  _adapters.set(store, adapter);
  return adapter;
}

function _nowIso(): string {
  return new Date().toISOString();
}

/**
 * Dispatch a DB query through all 5 layers.
 * Never throws — returns outcome + denyReason + rows/latency.
 *
 * @param request
 * @param caller
 * @returns
 */
async function query(
  request: typeof QueryRequest,
  caller: typeof Caller
): Promise<{
  outcome: "allow" | "deny";
  denyReason: string | null;
  rows?: any[];
  rowCount?: number;
  latencyMs: number;
}> {
  const started: number = Date.now();

  const outcome: typeof OutcomeRecord = {
    ts: _nowIso(),
    store: request && request.store,
    op: request && request.op,
    table: request && request.table,
    callerService: (caller && caller.service) || "",
    callerScope: (caller && caller.scope) || "",
    outcome: "deny",
    denyReason: null,
    latencyMs: 0,
  };

  try {
    // L2 — Identity (default-deny)
    const resolved = await resolveCaller(caller);
    if (!resolved) {
      outcome.denyReason = "L2_unknown_caller";
      return _finalize(outcome, started);
    }

    // L3 — Schema contract + authz (default-deny)
    const authzResult = await authz.check(resolved, request);
    if (!authzResult.allow) {
      outcome.denyReason = authzResult.reason || "L3_authz";
      return _finalize(outcome, started);
    }

    // L4 — Rate limit
    const rateOk = await limiter.check(resolved.service, request.store);
    if (!rateOk) {
      outcome.denyReason = "L4_rate_limit";
      return _finalize(outcome, started);
    }

    // L1 — Adapter (actual query)
    const adapter = _getAdapter(request.store);
    if (!adapter) {
      outcome.denyReason = "L1_adapter";
      return _finalize(outcome, started);
    }

    const result = await adapter.execute(request);

    outcome.outcome = "allow";
    outcome.denyReason = null;
    outcome.rowCount = result && result.rowCount;
    const finalized = await _finalize(outcome, started);
    return { ...finalized, rows: result.rows, rowCount: result.rowCount };
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error("[db-gateway] query fatal:", err && (err as Error).message);
    outcome.denyReason = outcome.denyReason || "L1_adapter";
    return _finalize(outcome, started);
  }
}

async function _finalize(
  outcome: typeof OutcomeRecord,
  started: number
): Promise<{
  outcome: "allow" | "deny";
  denyReason: string | null;
  latencyMs: number;
}> {
  outcome.latencyMs = Date.now() - started;
  try {
    await audit.record(outcome);
  } catch (_e: unknown) {
    // swallowed
  }
  return {
    outcome: outcome.outcome,
    denyReason: outcome.denyReason,
    latencyMs: outcome.latencyMs,
  };
}

export = { query };