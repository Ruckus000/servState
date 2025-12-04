Neon MCP Server

Overview
- Adds a Neon Model Context Protocol (MCP) server entry to `.claude/config.json` so Claude Desktop can launch it.
- The MCP server lets tools run SQL against your Neon Postgres using the connection string you provide.

Configured Server
- Name: `neon`
- Command: `npx -y neon-mcp-server`
- Env: `DATABASE_URL` (you must set or fill in)

Setup
- Option 1 — Use npx (no global install):
  - Ensure you have Node.js and npm.
  - Claude Desktop will execute `npx -y neon-mcp-server` from your shell.
  - Provide `DATABASE_URL` via your shell environment or by editing `.claude/config.json` and setting the value.

- Option 2 — Install globally:
  - `npm i -g neon-mcp-server`
  - Update `.claude/config.json` to: `"command": "neon-mcp-server", "args": []`.

Environment
- Required: `DATABASE_URL` (Neon connection string, e.g. the pooled URL).
- Recommended: Use a least-privileged Neon role for MCP tasks (read-only unless you explicitly need writes).

Claude Desktop
- Restart Claude Desktop after editing `.claude/config.json`.
- Open Settings → Developer → MCP Servers and confirm `neon` is listed.

Notes
- This repo already contains Neon URLs in `servstate-app/.env.local`, but Claude Desktop does not read this file. Set `DATABASE_URL` in your shell or in `.claude/config.json`.
- If you prefer a different Neon MCP package name or a local server script, update the `command` and `args` accordingly.

