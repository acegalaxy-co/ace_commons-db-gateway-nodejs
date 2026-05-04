"use strict";
const IDBAdapter = require("./adapter-interface");

class SqliteAdapter extends IDBAdapter {
  get store(): string {
    return "sqlite";
  }

  async execute(_request: unknown): Promise<unknown> {
    // TODO Phase 2: open db file per DB_GATEWAY_SQLITE_PATH env, run prepared stmt.
    throw new Error("SqliteAdapter.execute not implemented (Phase 1 stub)");
  }
}

function create(): SqliteAdapter {
  return new SqliteAdapter();
}

export = { SqliteAdapter, create };