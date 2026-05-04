"use strict";
const { QueryRequest } = require("../types");

abstract class IDBAdapter {
  abstract get store(): "postgres" | "sqlite" | "notion";

  abstract execute(
    request: typeof QueryRequest
  ): Promise<{ rows?: unknown[]; rowCount?: number }>;
}

export = { IDBAdapter };