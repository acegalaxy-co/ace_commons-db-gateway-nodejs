"use strict";
const IDBAdapter = require("./adapter-interface");

class NotionAdapter extends IDBAdapter {
  get store(): string {
    return "notion";
  }

  async execute(request: { op?: string } | null | undefined): Promise<never> {
    // Defence in depth: even if authz L3 missed, adapter refuses delete.
    if (request && request.op === "delete") {
      throw new Error("notion.delete blocked — use archive (rules/db/02-notion-no-delete.md)");
    }
    // TODO Phase 2: map QueryRequest → Notion API client calls.
    // Allowed ops: read (databases.query, pages.retrieve), update, create, archive (update with archived:true).
    throw new Error("NotionAdapter.execute not implemented (Phase 1 stub)");
  }
}

function create(): NotionAdapter {
  return new NotionAdapter();
}

export = { NotionAdapter, create };