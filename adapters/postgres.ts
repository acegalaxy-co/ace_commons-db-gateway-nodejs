"use strict";
const IDBAdapter = require("./adapter-interface");

class PostgresAdapter extends IDBAdapter {
  get store(): string {
    return "postgres";
  }

  async execute(_request: unknown): Promise<unknown> {
    // TODO Phase 2: implement pg.Pool + parameterized query from QueryRequest.
    // Do NOT expose pg.Client / Pool outside this file.
    throw new Error("PostgresAdapter.execute not implemented (Phase 1 stub)");
  }
}

function create(): PostgresAdapter {
  return new PostgresAdapter();
}

export = { PostgresAdapter, create };