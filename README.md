# Web Dev Key Concepts — Full-Stack Backend Course Guide

This repository is my practice companion for a ~17 hour full-stack backend course. I work through
the course **one topic at a time**: I read the concept, type the practice code myself, run it, and
have it reviewed before moving on. Everything outdated or irrelevant is flagged so I don't waste
time on dead patterns.

## How to use this guide

- Each section below lists every course topic and its subtopics, with the key APIs/commands to learn.
- Practice files live in `node/01/src/` (Section 1), `postgres/` (Section 2), and an Express app
  for Sections 3–6.
- Section 1 files are numbered in the order the course covers them. `npm run <number>` runs each one
  from `node/01/`.
- Checkboxes in each section track progress.

---

## Course at a glance

| # | Section | Duration | Status |
|---|---------|----------|--------|
| 1 | Node.js Fundamentals & Internals | 05:07:05 | In progress |
| 2 | PostgreSQL & SQL Database Management | 04:07:00 | Not started |
| 3 | Express.js & Application Structure | 01:33:07 | Not started |
| 4 | Authentication & Authorization | 02:15:46 | Not started |
| 5 | Redis & Caching | 02:18:26 | Not started |
| 6 | File Uploads, Background Jobs & Advanced Integrations | 01:28:41 | Not started |

## Outdated / irrelevant flags (verified 2026)

| Topic | Flag |
|-------|------|
| **Express 4 → 5** | `npm install express` now installs **Express 5** (default since Mar 2025); Express 4 is maintenance-only (EOL ~Oct 2026). Course code is likely Express 4. Route syntax changed (`*name`, `{:param}`), async errors auto-forward to the error middleware, `req.body` is `undefined` until parsed, `req.query` is a getter. Sections 3–6 will be written for Express 5 with diffs called out. |
| **Node version** | Repo runs Node 22.16 (Maintenance LTS until Apr 2027) — fine for the whole course. Node 24 is Active LTS; upgrade when convenient. |
| **`fs.F_OK/R_OK/W_OK/X_OK`** | Runtime-deprecated at top level in Node 24+ — use `fs.constants.*`. Minor. |
| **`fs.truncate(fd)`** | Deprecated (DEP0081) — use `fs.ftruncate`. Minor. |
| **Cluster module** | Still works but legacy-leaning; PM2 / `worker_threads` are the modern alternatives. Learn for understanding. |
| **jsonwebtoken** | Still standard but has had CVEs; `jose` is the modern alternative. Fine to learn with `jsonwebtoken`. |
| **Redis client** | Official `redis` v4+ and `ioredis` both fine. BullMQ v5 requires Redis >= 6.2. |
| **TypeScript 7 devDependency** | The new native (Go) compiler. `tsx` runs the code regardless, so no action needed. |
| **Callbacks / callback-style `fs`** | Historical/legacy context — still relevant to read but new code should use `async/await` + `fs/promises`. |

---

# Section 1: Node.js Fundamentals & Internals (05:07:05)

Practice files: `node/01/src/XX-name.ts`, run with `npm run XX` from `node/01/`.

### 1.0 Introduction (0:00) ✅
- What Node.js is: a JavaScript runtime built on Chrome's V8 engine, letting JS run outside the browser.
- Why learn Node for backend: single language for front + back, huge ecosystem (npm), fast I/O.
- What the course builds: a task-management REST API with auth, caching, file uploads, background jobs.
- Mental model: client (browser) sends HTTP requests → server (Node) processes → database stores data.

### 1.1 Node.js installation, npm, package.json, scripts (5:06) ✅
Subtopics:
- Installing Node (LTS) — on Windows use the installer or `nvm-windows` to switch versions.
- `npm init -y` creates a `package.json`; key fields: `name`, `version`, `main`, `scripts`, `type`.
- `"type": "commonjs"` vs `"module"` (ESM) and how it affects `require` vs `import`.
- `dependencies` (needed at runtime) vs `devDependencies` (build/dev only).
- Installing TS tooling: `npm install -D typescript tsx @types/node`.
- Scripts: `npm run dev`, `tsx watch src/file.ts` — `tsx` runs TypeScript without a build step.

### 1.2 tsconfig.json file setup (35:25) ✅
Subtopics:
- `compilerOptions`: `target` (ES2022), `module`/`moduleResolution` (NodeNext), `outDir`/`rootDir`.
- Strictness flags: `strict`, `noImplicitAny`, `strictNullChecks`.
- Interop: `esModuleInterop`, `skipLibCheck`, `types: ["node"]`.
- `include`/`exclude` tell TypeScript which files to type-check.
- Note: `tsx` ignores tsconfig emit and just runs files — tsconfig is for editor type-checking.

### 1.3 Process object (40:02) ✅
Subtopics:
- `process.env` — environment variables (ports, secrets, DB URLs, API keys); always strings or `undefined`.
- `process.argv` — command-line arguments; index 0 = node, 1 = script path, values start at index 2.
- `process.exit(code)` / `exitCode` — stop the process; non-zero = failure. Prefer setting `exitCode` so cleanup runs.
- Lifecycle events: `process.on("exit")` for final logging/cleanup (no async there), signal handlers (`SIGINT`, `SIGTERM`) for graceful shutdown.
- Other useful bits: `process.cwd()`, `process.pid`, `process.platform`, `process.version`.
- Practice: flags like `--fail` / `--crash` read via `process.argv.includes(...)`.

### 1.4 Crypto module (55:51) ✅
Subtopics:
- `crypto.randomUUID()` — unique IDs for records, tokens.
- `crypto.randomBytes(n)` — cryptographically-secure random bytes; `.toString('hex')` for API keys / reset tokens / session secrets.
- Hashing is one-way: `data -> hash` (possible), `hash -> data` (not possible). `crypto.createHash('sha256').update(data).digest('hex')`.
- HMAC = hash with a secret: `createHmac('sha256', secret).update(data).digest('hex')` — verifies data wasn't tampered with.
- Security note: hashing alone is for integrity; passwords need slow algorithms (bcrypt/argon2) — used in Section 4.

### 1.5 OS module (1:11:53) ✅
Subtopics:
- `os.platform()`, `os.arch()`, `os.type()`, `os.release()` — environment info.
- `os.cpus()` — CPU details; `.length` tells you how many cores (useful for cluster sizing).
- `os.freemem()` / `os.totalmem()` — convert bytes to GB with `bytes / 1024 ** 3`.
- `os.homedir()`, `os.tmpdir()`, `os.uptime()`.

### 1.6 Path module (1:18:26) ✅
Subtopics:
- `path.join(...parts)` — builds cross-platform paths (adds `\` on Windows, `/` on Linux/macOS).
- `path.dirname(p)` — folder, `path.basename(p)` — file name, `path.extname(p)` — `.ext`.
- `path.resolve(...)` — absolute path; `path.normalize()` — cleans up `..`/`.`.
- `path.sep` — platform separator. Never hardcode `/` or `\`.
- Example: `path.join(process.cwd(), "users", "43", "profile.png")`.

### 1.7 Timers module (1:31:23) ✅
Subtopics:
- `setTimeout(cb, ms)` / `clearTimeout(id)` — run once after a delay; never blocks (async).
- `setInterval(cb, ms)` / `clearInterval(id)` — run repeatedly until cleared.
- `setImmediate(cb)` — run on the next event-loop "check" phase (after current I/O), before timers in some cases.
- Promise version: `import { setTimeout as sleep } from "node:timers/promises"` — `await sleep(1500)`.
- Difference: `setTimeout(cb, 0)` vs `setImmediate(cb)` ordering depends on context (timers vs check phase).

### 1.8 Callbacks (1:49:14) 🔄 In progress
Subtopics:
- A callback is a function passed into another function, invoked when the async work finishes.
- Node convention: **error-first** callbacks — `cb(err, result)`, check `err` first.
- Used by old Node APIs (e.g., callback-style `fs.readFile`).
- Problem: nesting many async steps creates "callback hell" / pyramid of doom.
- Modern take: don't write new callback APIs; read them so you understand old code and legacy packages.

### 1.9 Promises (2:00:02) 🔄 In progress
Subtopics:
- A Promise represents work that will finish later; states: `pending` -> `fulfilled` | `rejected`.
- Creating: `new Promise((resolve, reject) => ...)`.
- Consuming: `.then(onFulfilled)`, `.catch(onRejected)`, `.finally()`; chaining flattens callback hell.
- Combinators: `Promise.all` (all or fail), `Promise.allSettled` (never rejects), `Promise.race` (first to settle), `Promise.any` (first to fulfill).
- `import { promisify } from "node:util"` converts a callback-style function into a Promise-returning one.

### 1.10 async/await (2:00:02) 🔄 In progress
Subtopics:
- Sugar over Promises: `await` pauses the `async` function until the Promise settles.
- Errors handled with `try/catch` instead of `.catch()`.
- Only valid inside an `async function`; in CommonJS keep a `main()` wrapper (no top-level await).
- Parallel work: `await Promise.all([...])` — don't `await` calls in sequence when they're independent.
- This is the style used for the rest of the course.

### 1.11 File system: Synchronous APIs (2:09:21) ⬜
Subtopics:
- `fs.readFileSync(path, "utf8")` — read; `fs.writeFileSync(path, data)` — write (overwrites).
- `fs.mkdirSync(path, { recursive: true })`, `fs.existsSync(path)`, `fs.appendFileSync`, `fs.statSync`, `fs.unlinkSync`, `fs.rmSync`.
- All `*Sync` functions **block** the event loop — fine for startup/config reads, bad for request handlers.
- Always use absolute paths (combine with `path.join`).
- Returns `Buffer` unless you pass an encoding like `"utf8"`.

### 1.12 File system: Callback APIs (2:26:22) ⬜
Subtopics:
- `fs.readFile(path, encoding, (err, data) => ...)` — non-blocking, error-first callback.
- Same API shape for `writeFile`, `mkdir`, `appendFile`, etc.
- Pros: doesn't block the event loop. Cons: nested callbacks get messy; needs `promisify` or Promises.

### 1.13 File system: Promise APIs (2:33:18) ⬜
Subtopics:
- `import { readFile, writeFile, mkdir } from "node:fs/promises"` — all return Promises.
- Use with `async/await` and `try/catch` — the idiomatic modern way.
- `readFile(path, "utf8")`, `writeFile(path, data)`, `mkdir(path, { recursive: true })`, `rm(path, { recursive: true, force: true })`.

### 1.14 Buffers (2:36:32) ⬜
Subtopics:
- A `Buffer` is raw binary data in memory (think "stream of bytes"), used when dealing with files, network, streams.
- `Buffer.from("hello")`, `Buffer.alloc(n)`, `Buffer.from(base64string, "base64")`.
- Reading out: `.toString("utf8")`, `.toString("hex")`, `.toString("base64")`; `.length` = bytes, `Buffer.byteLength(str)`.
- `buf.subarray(start, end)` — slice without copying; `buf.copy()` — copy.
- JS strings are UTF-16; Buffers are bytes — encodings matter when converting between them.

### 1.15 Node.js URL module (2:48:32) ⬜
Subtopics:
- WHATWG `new URL(str)` gives `.href`, `.origin`, `.protocol`, `.host`, `.port`, `.pathname`, `.search`, `.searchParams`, `.hash`.
- `url.searchParams.get("key")`, `.set()`, `.append()`, `.has()` — read/modify query strings.
- Legacy `url.parse()` (deprecated) — understand it only for reading old code.
- Used for parsing request URLs in raw HTTP servers and for building/fetching external URLs.

### 1.16 EventEmitter: listeners, on, emit, once (2:56:39) ⬜
Subtopics:
- `EventEmitter` is the event system Node is built on (`events` module).
- `emitter.on("event", fn)` — subscribe; `emitter.emit("event", data)` — fire all listeners.
- `emitter.once("event", fn)` — listen for a single occurrence, then auto-remove.
- `emitter.off(...)` / `removeListener`, `emitter.removeAllListeners()`, `emitter.listenerCount(event)`.
- Special `"error"` event: emitting it without a listener throws and crashes the process.
- Custom objects can `class X extends EventEmitter` — pattern used everywhere (streams, HTTP, etc.).

### 1.17 Streams (3:07:49) ⬜
Subtopics:
- A stream is data arriving in chunks over time instead of all at once — memory-friendly for big files/network.
- Types: `Readable`, `Writable`, `Duplex` (both), `Transform` (modify chunks).
- `fs.createReadStream`, `fs.createWriteStream`, `readable.pipe(writable)`.
- Events: `"data"`, `"end"`, `"error"`, `"finish"`; chunks are Buffers.
- Backpressure: when the consumer is slower than the producer, the stream signals pause/resume.
- `process.stdout` is a writable stream; request bodies are readable streams.

### 1.18 Node.js HTTP module introduction (3:22:07) ⬜
Subtopics:
- `http` is the built-in server/client module; what HTTP is: request line, headers, body, methods (GET/POST/PUT/DELETE), status codes.
- `IncomingMessage` (request) and `ServerResponse` (response) objects.
- Express (Section 3) wraps this module — learning the raw version makes Express obvious.

### 1.19 Basic HTTP server (3:28:56) ⬜
Subtopics:
- `http.createServer((req, res) => {})` then `server.listen(port, cb)`.
- `res.writeHead(status, { "Content-Type": "..." })`, `res.end("body")`.
- `req.method`, `req.url`, `req.headers`.
- Respond with `404` for unknown routes; handle `server.on("error")` for port-in-use.

### 1.20 HTTP routing concepts (3:44:00) ⬜
Subtopics:
- Routing = matching `method + path` to a handler.
- Parse `req.url` with `new URL(req.url, "http://localhost")`; switch on `pathname`.
- Route params (`/tasks/:id`), query strings, wildcard/404 fallback.
- Keep handlers small and organized — the same idea Express formalizes.

### 1.21 Reading the request body in plain Node.js (3:52:57) ⬜
Subtopics:
- The body arrives in chunks: collect via `req.on("data", chunk)` and `req.on("end", ...)`.
- `JSON.parse()` the accumulated string for JSON requests.
- Check `Content-Type`; guard with `Content-Length`/size limits to prevent memory abuse.
- Handle `req.on("error")` and invalid JSON (respond 400).

### 1.22 Working with JSON response data (4:05:51) ⬜
Subtopics:
- Set `res.setHeader("Content-Type", "application/json")`.
- `JSON.stringify()` objects before `res.end()`.
- Proper status codes: 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Server Error.
- Consistency: same response shape everywhere (e.g., `{ data, message }`).

### 1.23 Working with external APIs and AbortController (4:15:16) ⬜
Subtopics:
- Node has a global `fetch` (since 18) — `const res = await fetch(url)`.
- `res.ok`, `res.status`, `res.json()`.
- Timeouts: `AbortController` + `abort()` + `setTimeout`, pass `signal` to `fetch`; catch `AbortError`.
- `Promise.race` as an alternative timeout pattern.
- Handle external API failures gracefully (retries, fallbacks, 5xx mapping).

### 1.24 Node.js runtime internals (4:32:20) ⬜
Subtopics:
- JS is single-threaded but Node can handle many concurrent requests via an **event loop**.
- Call stack (sync code) + task/microtask queues (promises) + event loop phases.
- Diagram: your JS code → V8 → libuv (event loop + thread pool) → OS.
- Why `await` doesn't block: it returns control to the event loop.

### 1.25 V8 engine overview (4:44:22) ⬜
Subtopics:
- V8 = Google's JS engine (also powers Chrome); compiles JS to machine code (JIT).
- Handles memory management + garbage collection (mark-and-sweep generational GC).
- Inline caching, hidden classes — why V8 is fast; `v8.getHeapStatistics()`.
- Node adds the "outer world" (fs, net, timers) via libuv; V8 only executes JS.

### 1.26 libuv (4:50:39) ⬜
Subtopics:
- libuv = C library that implements the event loop and async I/O for Node.
- Delegates blocking OS work (disk, DNS, some crypto) to a thread pool (default 4 threads; `UV_THREADPOOL_SIZE`).
- Network I/O uses OS-level polling (epoll/kqueue/IOCP) — no thread needed.
- This is why `fs` reads don't freeze the server but heavy sync CPU code does.

### 1.27 Blocking vs. non-blocking I/O (4:58:25) ⬜
Subtopics:
- Blocking: code waits for the operation to finish (sync APIs freeze the loop).
- Non-blocking: operation starts, callback/promise fires later (loop stays free).
- Practical rule: never use `*Sync` fs/network inside request handlers.
- CPU-bound tasks also block — that's what workers/cluster/background jobs solve (Section 6).

### 1.28 Cluster module (5:02:35) ⬜
Subtopics:
- A single Node process uses one CPU core; `cluster` forks worker processes, one per core.
- Master process distributes connections; workers share the same server port.
- `cluster.fork()`, `cluster.isPrimary` / `cluster.isMaster` (older name), worker IPC messages.
- Alternatives: PM2 (`pm2 start -i max`), or scale horizontally with multiple machines behind a load balancer.
- Legacy-leaning today; understand it, don't build new apps on it.

---

# Section 2: PostgreSQL & SQL Database Management (04:07:00)

Practice files: `postgres/` folder with `.sql` scripts run via `psql -f file.sql`.

### 2.1 PostgreSQL introduction (5:07:05) ⬜
- What a relational database is; tables = rows + columns.
- SQL vs NoSQL; why Postgres: ACID, rich types, JSON support, huge ecosystem.
- Client-server model: your app (client) connects over TCP to the DB server (port 5432).

### 2.2 Installation, setup, and database basics (5:09:00) ⬜
- Install PostgreSQL + `pgAdmin` (GUI) or use `psql` (CLI); set a postgres superuser password.
- Connection details: host, port (5432), database, user, password.
- `psql -U username` to enter the CLI; `\l` list databases, `\dt` list tables, `\q` quit.

### 2.3 Creating a new database (5:24:40) ⬜
- `CREATE DATABASE name;` — a database is a container of schemas/tables.
- `\c name` to connect; `DROP DATABASE name;` (careful — destroys data).

### 2.4 Creating a schema (5:33:50) ⬜
- A schema is a namespace inside a database (like folders).
- `CREATE SCHEMA name;` — defaults to `public`; `search_path` controls which schema is used.

### 2.5 Creating a table (5:40:34) ⬜
- `CREATE TABLE name (col type [constraint], ...);`
- Columns have a name + data type; rows are inserted later.
- `DROP TABLE name;` and `TRUNCATE name;` (empty a table, keep structure).

### 2.6 SQL data types (5:50:11) ⬜
- `SERIAL` / `BIGSERIAL` / `IDENTITY` — auto-incrementing integer IDs.
- `INT`/`INTEGER`, `BIGINT` — whole numbers; `NUMERIC(p,s)` — exact decimals (money).
- `VARCHAR(n)`, `TEXT` — strings; `BOOLEAN`; `TIMESTAMP`/`TIMESTAMPTZ` — date+time (with timezone).
- `UUID` — globally unique IDs; `JSON`/`JSONB` — JSON storage (JSONB is binary, faster to query).

### 2.7 Other SQL data types (5:59:00) ⬜
- `DATE`, `TIME` — smaller date/time pieces.
- `ARRAY` (e.g., `TEXT[]`), `ENUM` (fixed set of values), `BYTEA` (binary), `INET` (IP addresses), `GENERATED` columns.

### 2.8 NULL, empty string, and zero values (6:07:29) ⬜
- `NULL` = "no value / unknown", not the same as `''` (empty string) or `0` (number).
- SQL three-valued logic: comparisons with NULL give NULL (neither true nor false).
- Testing for NULL requires `IS NULL` / `IS NOT NULL`, never `= NULL`.
- Design decision: when is a field NULL vs `''` vs `0`? Each carries different meaning.

### 2.9 Constraints (6:15:33) ⬜
- `NOT NULL` — column must have a value; `UNIQUE` — no duplicates.
- `DEFAULT value` — fallback when no value given; `CHECK (expr)` — custom validation.
- `PRIMARY KEY` — unique + not null; `FOREIGN KEY` — references another table.
- Constraints protect data integrity at the database level (defense in depth).

### 2.10 Primary key concept (6:25:03) ⬜
- Uniquely identifies each row; `SERIAL PRIMARY KEY` or `UUID PRIMARY KEY`.
- Used as the `id` other tables reference via foreign keys.
- PK trade-offs: `SERIAL` (small, sequential, guessable) vs `UUID` (random, unguessable, bigger).

### 2.11 SQL concepts base file setup (6:30:12) ⬜
- Keep SQL in `.sql` files: `psql -d dbname -f setup.sql`.
- Structure: create schema/table, then seed data — makes it re-runnable.

### 2.12 Insert a single row (6:36:23) ⬜
- `INSERT INTO table (col1, col2) VALUES (val1, val2);`
- Order matters only against the column list; omitted columns use defaults/NULL.
- `INSERT ... RETURNING *;` to get the inserted row back.

### 2.13 Insert multiple rows (6:41:38) ⬜
- Multiple tuples: `VALUES (..), (..), (..);` — one round-trip instead of many.

### 2.14 AND, OR, and NOT filters (6:55:33) ⬜
- `WHERE a AND b`, `WHERE a OR b`, `WHERE NOT a`.
- Precedence: NOT > AND > OR — use parentheses when mixing.
- Logic returns true/false/NULL; NULL in a condition often silently excludes rows.

### 2.15 LIKE pattern matching (7:03:30) ⬜
- `LIKE 'P%'` — starts with P; `'%son'` — ends with son; `'%mid%'` — contains; `'_'` — single char.
- `ILIKE` — case-insensitive version.
- `%` at the start defeats indexes — be careful on big tables.

### 2.16 IN, NOT IN, and BETWEEN (7:09:31) ⬜
- `WHERE col IN (1,2,3)` — membership; `NOT IN` — exclusion (watch for NULL values).
- `WHERE col BETWEEN 10 AND 20` — inclusive range.

### 2.17 NULL and NOT NULL in WHERE (7:16:15) ⬜
- `WHERE col IS NULL` / `WHERE col IS NOT NULL`.
- `COALESCE(col, 'fallback')` — first non-NULL; `NULLIF(a, b)` — NULL if equal.

### 2.18 ORDER BY (7:20:08) ⬜
- `ORDER BY col ASC|DESC`; sort by multiple columns (`ORDER BY role, name DESC`).
- NULLs sort first/last depending on direction and version.

### 2.19 LIMIT, OFFSET, and pagination (7:22:29) ⬜
- `LIMIT n` — max rows; `OFFSET n` — skip n rows → `LIMIT 10 OFFSET 20` = page 3 of 10.
- Cost: high offsets make the DB scan skipped rows — alternative is keyset pagination (`WHERE id > lastId`).

### 2.20 Update a single row (7:29:11) ⬜
- `UPDATE table SET col = val WHERE id = X;` — always filter or you update everything.
- `UPDATE ... RETURNING *;` to see the new row.

### 2.21 Update multiple rows (7:32:24) ⬜
- Same statement, broader `WHERE` (e.g., `WHERE status = 'pending'`).
- Bulk updates in one statement are atomic.

### 2.22 Delete rows (7:36:15) ⬜
- `DELETE FROM table WHERE ...;` — filtered removal; without WHERE deletes all rows.
- `TRUNCATE table;` — fast empty; `DROP TABLE` — removes the table itself.

### 2.23 RETURNING after INSERT, UPDATE, DELETE (7:38:46) ⬜
- `RETURNING *` (or specific columns) returns affected rows — avoids a follow-up SELECT.
- Used in Node apps to return the freshly-created record in one query.

### 2.24 Relationships and seeding tables/data (7:44:29) ⬜
- Tables relate via shared IDs; seed data = insert realistic rows to test queries.
- Order matters when seeding related tables (parents first).

### 2.25 Foreign keys (7:58:23) ⬜
- `FOREIGN KEY (col) REFERENCES other(id)` — enforces that referenced rows exist.
- `ON DELETE CASCADE` (delete children with parent), `ON DELETE SET NULL` (leave child, null the ref), default `NO ACTION` (block).
- Prevents orphan rows.

### 2.26 One-to-many relationships (8:02:38) ⬜
- One parent row ↔ many child rows (e.g., one user → many tasks) via a FK on the child table.
- Model in SQL: child table holds `user_id` FK.

### 2.27 INNER JOIN (8:09:59) ⬜
- `FROM a JOIN b ON a.id = b.a_id` — only rows with a match on both sides.
- Combines columns of both tables into one result set.

### 2.28 LEFT JOIN (8:15:05) ⬜
- `LEFT JOIN` keeps all rows from the left table, NULLs where the right side has no match.
- Use when you want e.g. all users even those with zero tasks.

### 2.29 Many-to-many relationships (8:21:03) ⬜
- Two tables + a junction table holding both FKs (e.g., `students_courses`).
- Query with two joins across the junction.

### 2.30 Table aliases (8:28:28) ⬜
- `FROM users u JOIN tasks t ON ...` — shortens names; required when a table joins itself.
- `SELECT u.name AS username` — rename columns in output.

### 2.31 Aggregate functions (8:34:06) ⬜
- `COUNT(*)`, `SUM(col)`, `AVG(col)`, `MIN(col)`, `MAX(col)` — collapse many rows into one value.
- Aggregates ignore NULL (except `COUNT(*)`).
- Used with `GROUP BY` to aggregate per group.

### 2.32 GROUP BY and HAVING (8:40:49) ⬜
- `GROUP BY col` — one output row per distinct value; aggregates computed per group.
- `HAVING` filters groups (after grouping), `WHERE` filters rows (before grouping).
- Rule: any non-aggregated column in SELECT must appear in GROUP BY.

### 2.33 COUNT DISTINCT (8:48:07) ⬜
- `COUNT(DISTINCT col)` — count unique values; `COUNT(*)` counts all rows.

### 2.34 Subqueries (8:53:41) ⬜
- Query inside a query: `SELECT ... FROM t WHERE id IN (SELECT id FROM other WHERE ...)`.
- Can live in SELECT, FROM, WHERE; correlated subqueries reference outer columns.
- Often replaceable with JOIN — know both.

### 2.35 Indexes: concept only (8:58:00) ⬜
- An index is a lookup structure (default B-tree) speeding up WHERE/ORDER/JOIN on that column.
- Trade-off: faster reads, slower writes (must maintain index), extra storage.
- Don't index everything — index what you actually filter/sort by. `EXPLAIN ANALYZE` to inspect.

### 2.36 Transactions (9:08:18) ⬜
- `BEGIN; ... COMMIT;` — all statements succeed together, or `ROLLBACK` undoes them all.
- ACID: Atomicity, Consistency, Isolation, Durability.
- Typical use: multi-step operations (charge + update stock) must not half-apply.

---

# Section 3: Express.js & Application Structure (01:33:07)

Practice: `express-app/` (Express 5) with `src/` structure; Postgres + Redis via Docker Compose.

### 3.1 Express setup, Pino logger, folder structure (9:14:05) ⬜
Subtopics:
- What Express is: a routing + middleware layer on top of the raw `http` module.
- **Express 5 flag**: `npm install express` now gives v5 (course code is likely v4). Route syntax and parser defaults differ.
- Folder structure: `src/config/`, `src/routes/`, `src/middlewares/`, `src/controllers/`, `src/db/`, `src/utils/`.
- Pino logger: fast structured JSON logging; `pino({ level })`, `logger.info(...)`; `pino-http` middleware logs every request; `pino-pretty` for readable dev output.

### 3.2 CORS, Express routing, health route, server setup (9:49:26) ⬜
Subtopics:
- `cors` middleware: `app.use(cors())` — allows browser apps on other origins to call the API.
- `express.json()` — parse JSON bodies into `req.body` (Express 5: `req.body` is `undefined` until parsed).
- Routing: `app.get/post/put/delete('/path', handler)`; route params `:id`; `req.query`.
- Health route: `GET /health` → `{ status: "ok" }` for uptime checks/load balancers.
- `app.listen(PORT, cb)`; graceful shutdown on `SIGTERM`/`SIGINT`.

### 3.3 Docker Compose setup, migration creation, SQL table schemas (10:01:13) ⬜
Subtopics:
- `docker-compose.yml`: `postgres` service (image, ports, `POSTGRES_USER/PASSWORD/DB`, volume for persistence), `redis` service.
- `docker compose up -d` / `docker compose down`.
- Migrations = versioned SQL files applied in order to evolve the schema.
- SQL schemas for the app: `users` (id, email, password_hash, name, role) and `tasks` (id, user_id FK, title, description, status, timestamps).

### 3.4 Database migration script implementation (10:16:59) ⬜
Subtopics:
- Node script using `pg` Pool to run the SQL files against the DB.
- Idempotent setup: `CREATE TABLE IF NOT EXISTS`, tracking applied migrations.
- `.env` config via `dotenv` for DB connection strings.

### 3.5 Error handler and registration/login flow overview (10:39:53) ⬜
Subtopics:
- Central error middleware: `app.use((err, req, res, next) => ...)` — Express 5 auto-forwards rejected promises here.
- Custom `AppError` class with status codes; production vs dev error shape (no stack leaks).
- Overview of auth flow that Section 4 implements: register → login → JWT → protected routes.

---

# Section 4: Authentication & Authorization (02:15:46)

Practice: same `express-app/` — auth routes, middleware, and task CRUD.

### 4.1 User registration flow (10:47:12) ⬜
Subtopics:
- Validate input (email format, password strength, required fields).
- Hash the password — **never store plaintext**. `bcrypt.hash(password, 10)` (salt rounds).
- Insert user; handle duplicate email (UNIQUE constraint → 409/400).
- Return success (optionally auto-login by issuing a JWT).
- Current flag: `bcrypt` vs `bcryptjs` (pure JS); both fine. `argon2` is the modern upgrade.

### 4.2 User login flow and JWT authentication (11:14:56) ⬜
Subtopics:
- Look up user by email; `bcrypt.compare(password, hash)` to verify.
- On success sign a JWT: `jwt.sign({ id, role }, SECRET, { expiresIn })` via `jsonwebtoken`.
- JWT anatomy: header.payload.signature; verify on each request → `jwt.verify(token, SECRET)`.
- Keep the secret in `.env`; short expiry + refresh tokens are the production pattern.
- Flag: `jsonwebtoken` has had CVEs; `jose` is the modern alternative — fine to learn with `jsonwebtoken`.

### 4.3 Auth/admin middleware and fetching current user (11:33:21) ⬜
Subtopics:
- `authMiddleware`: read `Authorization: Bearer <token>`, verify, attach `req.user`.
- `adminMiddleware`: after auth, check `req.user.role === "admin"` else 403.
- `GET /me` (or `/api/users/me`) returns the current user's info.
- Middleware ordering: `[auth, admin]` composes (admin requires auth).

### 4.4 User tasks CRUD implementation (11:48:13) ⬜
Subtopics:
- Create task (user-scoped: `user_id` from `req.user`), list own tasks, get one, update, delete.
- Ownership checks: users can only touch their own rows (`WHERE id = ? AND user_id = req.user.id`).
- Input validation + status transitions (e.g., `pending → in_progress → completed`).
- SQL parameterization (`$1, $2`) — never string-interpolate user input (SQL injection).

### 4.5 Admin features: fetch all tasks, search, filter, update status (12:30:12) ⬜
Subtopics:
- Admin can list all tasks (all users), with pagination.
- Search: `WHERE title ILIKE '%term%'`; filter by status/user; combine with `AND`.
- Admin updates task status directly; sorting + `LIMIT/OFFSET`.
- Reuse Section 2 SQL skills: joins, `GROUP BY`, aggregates for stats endpoints.

---

# Section 5: Redis & Caching (02:18:26)

Practice: `express-app/` — add Redis with the official `redis` v4 client.

### 5.1 Redis introduction (13:02:58) ⬜
- In-memory key-value data store — extremely fast because data lives in RAM, not disk.
- Use cases: caching, rate limiting, queues, pub/sub, sessions.

### 5.2 Project overview (13:05:58) ⬜
- What we'll add to the existing API: caching, rate limiting, pub/sub notifications.

### 5.3 Installing Redis, what it is, why we need it (13:10:35) ⬜
- Options: Docker (`docker run -d -p 6379:6379 redis`), local install, or Redis Cloud.
- `redis-cli` to poke around; `SET/GET`, `PING` → `PONG`.
- Why: cut DB load and latency for hot reads; `docker-compose` service added in Section 6 also.

### 5.4 Redis data types (13:18:56) ⬜
- Overview: Strings, Hashes, Lists, Sets, Sorted Sets (ZSETs).

### 5.5 Strings (13:19:31) ⬜
- `SET key value`, `GET key`, `MGET`, `INCR`/`DECR` (atomic counters), `SETNX` (set if not exists), `SET key value EX 60` (with TTL).

### 5.6 Hashes (13:27:43) ⬜
- Store object-like fields: `HSET user:1 name "ali" role "admin"`, `HGET`, `HGETALL`, `HINCRBY`.
- Good for caching an entity's fields.

### 5.7 Lists (13:31:36) ⬜
- Ordered collections: `LPUSH/RPUSH`, `LPOP/RPOP`, `LRANGE key 0 -1`, `LLEN`.
- Use cases: recent items, simple queues.

### 5.8 Sets (13:35:28) ⬜
- Unordered unique members: `SADD`, `SMEMBERS`, `SISMEMBER`, `SREM`, `SUNION/SINTER`.
- Use cases: tags, unique viewers, membership checks.

### 5.9 TTL (Time To Live) (13:43:08) ⬜
- `EXPIRE key seconds`, `TTL key` (returns -2 expired/-1 no TTL).
- `SET key val EX n` shorthand. Auto-expiry keeps caches from growing forever.

### 5.10 Connecting Redis to a Node project (13:47:31) ⬜
- Official client: `import { createClient } from "redis"`; `await client.connect()`, `client.on("error")`.
- `await client.set/get`; store JSON with `JSON.stringify`/`JSON.parse`.
- Connection string from `.env` (`REDIS_URL`).

### 5.11 Redis caching, cache-aside pattern, stale cache, invalidation (13:55:37) ⬜
- Cache-aside: check cache → hit? return. miss → query DB → store in cache → return.
- Stale cache: data is a snapshot from the past — TTL bounds how stale it gets.
- Invalidation: delete/update the cache key on writes so reads don't serve old data.

### 5.12 Redis caching example implementation (14:03:08) ⬜
- Standalone demo: cache a function result with TTL, measure hit vs miss.

### 5.13 Caching in the Node.js project (14:15:23) ⬜
- Cache hot endpoints (e.g., task list, banners): key like `tasks:${userId}`.
- Set TTL (e.g., 60s); invalidate on create/update/delete.
- Be careful not to cache per-user or sensitive data under shared keys.

### 5.14 Rate limiting with Redis (14:42:53) ⬜
- Per-client/IP counter: `INCR rate:ip` + `EXPIRE` → if count > limit return 429.
- Window-based limiting; `express-rate-limit` with a Redis store as the off-the-shelf option.
- Protects the API from abuse/brute force.

### 5.15 Redis Pub/Sub concept and example (14:55:33) ⬜
- Publishers send messages to a **channel**; subscribers receive them (fire-and-forget, no persistence).
- Node client: `client.publish("channel", msg)`, `client.subscribe("channel", (msg) => ...)`.
- Use cases: notifications, cache invalidation fan-out, live updates.

### 5.16 Redis Pub/Sub in the project (15:07:37) ⬜
- E.g., publish `task.created`, a subscriber logs/sends a notification.
- Note: for durable jobs use BullMQ (Section 6) — pub/sub is real-time, not reliable queues.

---

# Section 6: File Uploads, Background Jobs & Advanced Integrations (01:28:41)

Practice: `express-app/` + `cloudinary` + `bullmq`.

### 6.1 File upload flow, Cloudinary setup, Multer, Redis Docker Compose (15:21:24) ⬜
Subtopics:
- Flow: browser sends `multipart/form-data` → Multer parses it → upload file to Cloudinary → store returned URL in DB.
- Cloudinary: cloud storage/CDN for images; get `cloud_name`, `api_key`, `api_secret` from the dashboard (keep in `.env`).
- Multer: middleware that handles multipart uploads; `multer.memoryStorage()` keeps the file in RAM.
- Add a `redis` service to `docker-compose.yml` (needed by BullMQ).

### 6.2 Upload-to-Cloudinary helper implementation (15:32:51) ⬜
- `cloudinary.v2.uploader.upload_stream`/`upload` with `{ folder, resource_type: "image" }`.
- Accept the Multer `file.buffer`, return `secure_url`, `public_id`.
- Error handling: clean up the file if upload fails.

### 6.3 Multer middleware and banner create/fetch routes (15:41:29) ⬜
- Configure Multer: storage, `limits.fileSize` (e.g., 5 MB), `fileFilter` for allowed MIME types.
- Route: `POST /banners` → validate → upload → save `{ public_id, url }` in DB.
- Route: `GET /banners` → list banners (with caching, see next).

### 6.4 Banner Redis caching, cache-aside, invalidation (16:00:21) ⬜
- Cache the banner list in Redis with TTL (Section 5 patterns).
- Invalidate the `banners` key when a new banner is uploaded.

### 6.5 Deleting Cloudinary images, BullMQ, background jobs, queues, workers (16:10:35) ⬜
Subtopics:
- `cloudinary.v2.uploader.destroy(public_id)` — remove the image (on banner delete).
- Why background jobs: slow work (uploads, emails, image processing) shouldn't block the request.
- BullMQ: **queue** (jobs waiting, backed by Redis) + **worker** (processes jobs, separate process).
- `new Queue("banners")`, `queue.add("process", data)`, `new Worker("banners", job => ...)`.
- Job states (waiting, active, completed, failed), retries, concurrency.

### 6.6 Google OAuth login implementation (16:31:19) ⬜
Subtopics:
- OAuth flow: user → Google consent → callback with auth code → exchange for tokens.
- Verify the ID token (Google certs) → get email/name/picture → create or log in the user.
- Libraries: `google-auth-library` (verify id token) or Passport with the Google strategy.
- Issue your own JWT after OAuth so the rest of the app is unchanged.
- Sessions vs JWT decision; state parameter (CSRF protection).

---

## Progress checklist

### Section 1 — Node.js Fundamentals & Internals
- [x] Introduction
- [x] Installation, npm, package.json, scripts
- [x] tsconfig.json setup
- [x] Process object
- [x] Crypto module
- [x] OS module
- [x] Path module
- [x] Timers module
- [ ] Callbacks
- [ ] Promises and async/await
- [ ] File system: Synchronous APIs
- [ ] File system: Callback APIs
- [ ] File system: Promise APIs
- [ ] Buffers
- [ ] URL module
- [ ] EventEmitter
- [ ] Streams
- [ ] HTTP module introduction
- [ ] Basic HTTP server
- [ ] HTTP routing concepts
- [ ] Reading the request body
- [ ] JSON response data
- [ ] External APIs and AbortController
- [ ] Runtime internals
- [ ] V8 engine overview
- [ ] libuv
- [ ] Blocking vs. non-blocking I/O
- [ ] Cluster module

### Section 2 — PostgreSQL & SQL
- [ ] All 36 topics (intro → transactions)

### Section 3 — Express.js & Application Structure
- [ ] All 5 topics (setup → error handler)

### Section 4 — Authentication & Authorization
- [ ] All 5 topics (registration → admin features)

### Section 5 — Redis & Caching
- [ ] All 16 topics (intro → pub/sub in project)

### Section 6 — Advanced Integrations
- [ ] All 6 topics (file upload → Google OAuth)

---

*Keep a commit per completed topic so progress is easy to track in `git log`.*
