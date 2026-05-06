// query-postgres — minimal example for @acegalaxy/db-gateway
//
// Setup:
//   npm install
//   npm run build
//   node examples/query-postgres.js

const { query } = require("@acegalaxy/db-gateway");

(async () => {
  const rows = await query({
    adapter: "postgres",
    connectionString: process.env.DATABASE_URL,
    sql: "SELECT id, name FROM users WHERE active = $1 LIMIT 10",
    params: [true],
    caller: { service: "my-app", scope: "internal" }
  });
  console.log("Found", rows.length, "users");
})();
