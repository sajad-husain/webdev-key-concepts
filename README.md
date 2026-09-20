# Web Dev Key Concepts — Full-Stack Backend Course Guide

This repository is my practice companion for a ~17 hour full-stack backend course. I work through
the course **one topic at a time**: I read the concept, type the practice code myself, run it, and
have it reviewed before moving on.

> **This file is self-contained.** Every topic includes a code example, so it works as an **offline
> study guide** even without internet. Assumptions: Node 22, TypeScript with `tsx`, Express 5,
> PostgreSQL 17, Redis 7. Anything outdated is flagged inline.

## How to use this guide

- Each section below lists every course topic with the key APIs and a runnable code example.
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
| **Express 4 → 5** | `npm install express` now installs **Express 5** (default since Mar 2025); Express 4 is maintenance-only (EOL ~Oct 2026). Course code is likely Express 4. Route syntax changed (`*name`, `{:param}`), async errors auto-forward to the error middleware, `req.body` is `undefined` until parsed, `req.query` is a getter. Sections 3–6 are written for Express 5. |
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
- Mental model: client (browser) sends HTTP requests -> Node server processes -> database stores data.
- Node = V8 (runs JS) + libuv (does async I/O) + built-in modules (fs, http, crypto, ...).

### 1.1 Node.js installation, npm, package.json, scripts (5:06) ✅

Subtopics: install Node LTS (Windows installer or `nvm-windows`), `npm init -y`, `dependencies` vs
`devDependencies`, `"type": "commonjs"` vs `"module"`, `tsx` to run TypeScript directly.

```json
{
  "name": "backend",
  "version": "1.0.0",
  "type": "commonjs",
  "main": "index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "01": "tsx watch src/01-process-object.ts",
    "06": "tsx watch src/06-callbak-asyncAwait-promises.ts"
  },
  "devDependencies": {
    "@types/node": "^26.1.2",
    "tsx": "^4.23.1",
    "typescript": "^7.0.2"
  }
}
```

```bash
npm init -y                 # create package.json
npm install express         # runtime dependency -> "dependencies"
npm install -D tsx @types/node  # dev-only -> "devDependencies"
npm run dev                 # run a script
```

### 1.2 tsconfig.json file setup (35:25) ✅

Subtopics: `target`, `module`/`moduleResolution`, `outDir`/`rootDir`, strict flags, `include`/`exclude`.
`tsx` ignores emit and just runs files — tsconfig is for the editor's type-checking.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.3 Process object (40:02) ✅

Subtopics: `process.env` (secrets, ports), `process.argv` (CLI args), `process.exit(code)`,
lifecycle events (`exit`, `SIGINT`, `SIGTERM`), `process.cwd()`.

```ts
import process from "node:process";

// env vars: ALWAYS string or undefined, so coerce with Number()
const port = Number(process.env.PORT ?? 3000);
const isProd = process.env.NODE_ENV === "production";

// CLI args: argv[0] = node, argv[1] = script path, real args start at index 2
const command = process.argv[2] ?? "start";
const shouldCrash = process.argv.includes("--crash");

// lifecycle events
process.on("exit", (code) => console.log(`exited with code ${code}`));
process.on("SIGINT", () => { console.log("Ctrl+C pressed"); process.exit(0); });

if (shouldCrash) { console.error("manual crash"); process.exit(1); }
console.log({ port, isProd, command });
```

### 1.4 Crypto module (55:51) ✅

Subtopics: `randomUUID`, `randomBytes`, one-way hashing (`createHash`), HMAC (hash + secret).

```ts
import crypto from "node:crypto";

const id = crypto.randomUUID();                          // unique ID (records, tokens)
const apiKey = crypto.randomBytes(16).toString("hex");   // secret/api key

// one-way hash: data -> hash (cannot reverse)
const hash = crypto.createHash("sha256").update("hello").digest("hex");

// HMAC: data + secret -> hash  (proves the data wasn't tampered with)
const hmac = crypto.createHmac("sha256", "my-secret").update("hello").digest("hex");

console.log({ id, apiKey, hash, hmac });
```

### 1.5 OS module (1:11:53) ✅

Subtopics: `platform`, `arch`, `cpus`, `freemem`/`totalmem`, `homedir`, `tmpdir`.

```ts
import os from "node:os";

console.log("platform:", os.platform());            // win32 | linux | darwin
console.log("arch:", os.arch());                    // x64
console.log("cores:", os.cpus().length);            // use to size the cluster
console.log("free mem:", (os.freemem() / 1024 ** 3).toFixed(2), "GB");
console.log("home:", os.homedir());
console.log("tmp:", os.tmpdir());
```

### 1.6 Path module (1:18:26) ✅

Subtopics: `join`, `dirname`, `basename`, `extname`, `resolve`, `sep`. Never hardcode `/` or `\`.

```ts
import path from "node:path";
import process from "node:process";

const p = path.join(process.cwd(), "users", "43", "profile.photo.png");
// on Windows: C:\...\users\43\profile.photo.png

path.dirname(p);   // ...\users\43     (folder)
path.basename(p);  // profile.photo.png (file name)
path.extname(p);   // .png              (extension)
path.resolve("a", "../b");              // normalized absolute path
```

### 1.7 Timers module (1:31:23) ✅

Subtopics: `setTimeout`/`clearTimeout`, `setInterval`/`clearInterval`, `setImmediate`,
promise-based timers from `node:timers/promises`. Timers never block.

```ts
import { setTimeout as sleep } from "node:timers/promises";

setTimeout(() => console.log("once after 2s"), 2000);

let count = 0;
const interval = setInterval(() => {
  if (++count === 3) clearInterval(interval);   // stop after 3 ticks
}, 500);

setImmediate(() => console.log("runs in the check phase"));

async function main() {
  await sleep(1500);                            // promise-based sleep
  console.log("after 1.5s");
}
main();
```

### 1.8 Callbacks (1:49:14) 🔄 In progress

Subtopics: function passed to another to run after async work; **error-first** convention
`cb(err, result)`; callback hell (nested pyramids). Legacy — don't write new ones.

```ts
type User = { id: number; name: string };

// error-first callback: check err BEFORE using the result
function getUser(id: number, cb: (err: Error | null, user?: User) => void): void {
  setTimeout(() => {
    if (id <= 0) return cb(new Error("invalid id"));
    cb(null, { id, name: "ali" });
  }, 300);
}

getUser(1, (err, user) => {
  if (err) return console.error(err);
  console.log(user);   // { id: 1, name: 'ali' }
});

// CALLBACK HELL — nested async steps grow sideways into a pyramid:
getUser(1, (e1, u) => {
  getPosts(u.id, (e2, posts) => {
    getComments(posts[0].id, (e3, comments) => {
      // ...unreadable
    });
  });
});
```

### 1.9 Promises (2:00:02) 🔄 In progress

Subtopics: states `pending -> fulfilled | rejected`, `new Promise`, `.then/.catch/.finally`,
`Promise.all`, `Promise.race`, `util.promisify`.

```ts
type User = { id: number; name: string };

function getUser(id: number): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() =>
      id > 0 ? resolve({ id, name: "ali" }) : reject(new Error("bad id")), 300);
  });
}

getUser(1)
  .then((u) => console.log(u))
  .catch((err) => console.error(err))
  .finally(() => console.log("settled"));

// run two independent calls in parallel:
Promise.all([getUser(1), getUser(2)]).then(([a, b]) => console.log(a, b));
// Promise.race([getUser(1), timeout(200)])  -> first to settle wins
```

### 1.10 async/await (2:00:02) 🔄 In progress

Subtopics: `await` inside `async function`, `try/catch`, keep a `main()` wrapper in CommonJS,
`await Promise.all([...])` for parallel work. This is the style used for the rest of the course.

```ts
type User = { id: number; name: string };

function getUser(id: number): Promise<User> {
  return new Promise((resolve) => setTimeout(() => resolve({ id, name: "ali" }), 300));
}

async function main(): Promise<void> {
  try {
    const user = await getUser(1);      // reads like sync code
    console.log(user);

    const [a, b] = await Promise.all([getUser(1), getUser(2)]); // parallel
    console.log(a, b);
  } catch (err) {
    console.error("something failed:", err);
  }
}
main();
```

### 1.11 File system: Synchronous APIs (2:09:21) ⬜

Subtopics: `readFileSync`, `writeFileSync`, `appendFileSync`, `mkdirSync`, `existsSync`,
`unlinkSync`. All `*Sync` functions **block** the event loop — fine at startup, bad in handlers.

```ts
import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "data.txt");

fs.writeFileSync(file, "hello");            // create / overwrite
fs.appendFileSync(file, " world");          // add to end
fs.mkdirSync("uploads/nested", { recursive: true });  // create folders
const text = fs.readFileSync(file, "utf8"); // returns string (needs encoding)
console.log(text);                          // "hello world"
if (fs.existsSync(file)) fs.unlinkSync(file); // delete
```

### 1.12 File system: Callback APIs (2:26:22) ⬜

Subtopics: non-blocking version using error-first callbacks. Doesn't freeze the loop, but nests.

```ts
import fs from "node:fs";

fs.readFile("data.txt", "utf8", (err, data) => {
  if (err) return console.error(err);   // error-first!
  console.log(data);
});
```

### 1.13 File system: Promise APIs (2:33:18) ⬜

Subtopics: `node:fs/promises` + `async/await` — the idiomatic modern way.

```ts
import { readFile, writeFile, mkdir } from "node:fs/promises";

async function main() {
  await writeFile("data.txt", "hello");
  const text = await readFile("data.txt", "utf8");
  await mkdir("uploads/nested", { recursive: true });
  console.log(text);
}
main().catch(console.error);
```

### 1.14 Buffers (2:36:32) ⬜

Subtopics: raw binary data in memory; `Buffer.from`, `Buffer.alloc`, encodings
(`utf8`, `hex`, `base64`), `byteLength` (bytes, not characters).

```ts
import { Buffer } from "node:buffer";

const buf = Buffer.from("hello");       // bytes
buf.toString("utf8");                   // "hello"
buf.toString("hex");                    // 68656c6c6f
Buffer.from("68656c6c6f", "hex").toString("utf8");  // "hello"
Buffer.alloc(4);                        // 4 zero bytes
Buffer.byteLength("héllo");             // 6 bytes (not 5 chars)
```

### 1.15 Node.js URL module (2:48:32) ⬜

Subtopics: WHATWG `URL` class; `pathname`, `searchParams`, `origin`. Legacy `url.parse()`
is deprecated — only read old code with it.

```ts
import { URL } from "node:url";

const u = new URL("https://api.site.com:8080/tasks?page=2&status=done");

u.pathname;                          // /tasks
u.searchParams.get("page");          // "2"
u.searchParams.get("status");        // "done"
u.searchParams.set("page", "3");     // modify
u.origin;                            // https://api.site.com:8080
u.href;                              // full string
```

### 1.16 EventEmitter: listeners, on, emit, once (2:56:39) ⬜

Subtopics: `on`, `once`, `emit`, `off`/`removeAllListeners`, `listenerCount`, the special
`"error"` event (emitting it with no listener crashes the process).

```ts
import { EventEmitter } from "node:events";

const emitter = new EventEmitter();

emitter.on("data", (x: number) => console.log("on:", x));      // fires every time
emitter.once("data", (x: number) => console.log("once:", x));  // fires only once

emitter.emit("data", 1);   // on: 1 / once: 1
emitter.emit("data", 2);   // on: 2  (once listener already removed)

emitter.on("error", (err) => console.error(err.message));      // must handle!
emitter.emit("error", new Error("boom"));
```

### 1.17 Streams (3:07:49) ⬜

Subtopics: data in chunks; `Readable`/`Writable`/`Duplex`/`Transform`; `pipe`; chunk events;
backpressure; memory-friendly for big files.

```ts
import { createReadStream, createWriteStream } from "node:fs";

// copy a big file chunk-by-chunk — never loads it all into memory
createReadStream("big.txt")
  .pipe(createWriteStream("copy.txt"))
  .on("finish", () => console.log("copied"));

// watch chunks as they arrive
createReadStream("big.txt").on("data", (chunk: Buffer) => {
  console.log("chunk bytes:", chunk.length);
});
```

### 1.18 Node.js HTTP module introduction (3:22:07) ⬜

Subtopics: `http` = built-in server/client. HTTP basics: method (GET/POST/PUT/DELETE), path,
headers, body, status codes (200/201/400/404/500). `IncomingMessage` (req) and
`ServerResponse` (res). Express wraps this module — raw version makes Express obvious.

### 1.19 Basic HTTP server (3:28:56) ⬜

```ts
import http from "node:http";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello from Node!");
});

server.listen(3000, () => console.log("listening on :3000"));
// try: curl http://localhost:3000
```

### 1.20 HTTP routing concepts (3:44:00) ⬜

Subtopics: match `method + pathname` to a handler; route params (`/tasks/:id`), query strings,
404 fallback. This is the pattern Express formalizes.

```ts
import http from "node:http";

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  res.writeHead(200, { "Content-Type": "text/plain" });

  if (req.method === "GET" && url.pathname === "/") return res.end("Home");
  if (req.method === "GET" && url.pathname === "/tasks") {
    return res.end(`Tasks (page ${url.searchParams.get("page") ?? 1})`);
  }
  if (req.method === "GET" && url.pathname.startsWith("/tasks/")) {
    return res.end(`Task ${url.pathname.split("/")[2]}`);   // /tasks/:id
  }
  res.writeHead(404);
  res.end("Not Found");
});
server.listen(3000);
```

### 1.21 Reading the request body in plain Node.js (3:52:57) ⬜

Subtopics: body arrives in chunks (`data`/`end` events); `JSON.parse`; check `Content-Type`;
size limits; invalid JSON -> 400.

```ts
import http from "node:http";

const server = http.createServer((req, res) => {
  if (req.method !== "POST") { res.writeHead(405); return res.end(); }

  let body = "";
  req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
  req.on("end", () => {
    try {
      const data = JSON.parse(body);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ received: data }));
    } catch {
      res.writeHead(400);
      res.end("Invalid JSON");
    }
  });
});
server.listen(3000);
```

### 1.22 Working with JSON response data (4:05:51) ⬜

Subtopics: `Content-Type: application/json`, `JSON.stringify`, meaningful status codes.

```ts
// 201 = created, 200 = ok, 400 = bad request, 404 = not found, 500 = server error
res.writeHead(201, { "Content-Type": "application/json" });
res.end(JSON.stringify({ message: "created", task: { id: 1, title: "learn node" } }));

// consistent shape across the API:
// { data: ... }  on success,  { message: ... }  on error
```

### 1.23 Working with external APIs and AbortController (4:15:16) ⬜

Subtopics: global `fetch` (Node 18+), `res.ok`/`res.status`/`res.json()`, timeouts with
`AbortController`, catch `AbortError`.

```ts
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 5000);   // 5s timeout

try {
  const res = await fetch("https://api.example.com/users", {
    signal: controller.signal,
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  console.log(data);
} catch (err) {
  console.error("request failed or was aborted:", err);
} finally {
  clearTimeout(timer);
}
```

### 1.24 Node.js runtime internals (4:32:20) ⬜

Subtopics: JS is single-threaded but Node handles many requests via the **event loop**. Call stack
(sync) + microtask queue (promises) + event loop phases (timers, I/O, check). `await` returns
control to the loop — that's why it doesn't block.

```ts
console.log("1 sync");

setTimeout(() => console.log("2 timer"), 0);         // event loop: timers phase
Promise.resolve().then(() => console.log("3 microtask")); // microtasks run first
setImmediate(() => console.log("4 check"));          // event loop: check phase

// typical order: 1, 3, then 2 or 4 (depends on which phase runs next)
```

### 1.25 V8 engine overview (4:44:22) ⬜

Subtopics: V8 = Google's JS engine (also in Chrome); JIT-compiles JS to machine code; handles
garbage collection; Node's job is to add the "outer world" (fs, net, timers) on top.

```ts
import v8 from "node:v8";
const stats = v8.getHeapStatistics();
console.log("heap used MB:", (stats.used_heap_size / 1024 ** 2).toFixed(1));
```

### 1.26 libuv (4:50:39) ⬜

Subtopics: libuv = C library implementing the event loop + async I/O. Network I/O uses the OS
(epoll/kqueue/IOCP). Slow operations (disk reads, DNS, some crypto) go to a **thread pool**
(default 4 threads; env `UV_THREADPOOL_SIZE`). This is why `fs` reads don't freeze the server.

```
your JS code
   |  calls async fs.readFile
   v
libuv thread pool  --> OS reads file --> callback queued --> event loop runs it
```

### 1.27 Blocking vs. non-blocking I/O (4:58:25) ⬜

Subtopics: blocking = code waits (sync APIs freeze the loop); non-blocking = starts work,
finishes later via callback/promise. Rule: never use `*Sync` fs inside request handlers.

```ts
import fs from "node:fs";

console.log("start");
fs.readFileSync("data.txt");   // BLOCKS: nothing else can run meanwhile
console.log("end");            // end prints only AFTER the file is read

// non-blocking equivalent lets other work proceed while the file loads
fs.readFile("data.txt", "utf8", (err, data) => {
  if (err) return console.error(err);
  console.log("file ready");
});
```

### 1.28 Cluster module (5:02:35) ⬜

Subtopics: one Node process = one CPU core. `cluster` forks a worker per core; workers share the
port. Legacy-leaning — PM2 (`pm2 start -i max`) or scaling machines are modern options.

```ts
import cluster from "node:cluster";
import http from "node:http";
import { cpus } from "node:os";

if (cluster.isPrimary) {
  cpus().forEach(() => cluster.fork());          // master forks one worker per core
} else {
  http.createServer((req, res) =>
    res.end(`worker ${process.pid} handled the request`)
  ).listen(3000);
}
```

---

# Section 2: PostgreSQL & SQL Database Management (04:07:00)

Practice: `postgres/` folder with `.sql` scripts run via `psql -d task_app -f file.sql`.

### 2.1 PostgreSQL introduction (5:07:05) ⬜
- Relational DB: data in tables = rows (records) + columns (fields).
- Why Postgres: ACID, rich data types, JSON support, huge ecosystem.
- Client-server: your app connects to the DB server over TCP (default port 5432).

### 2.2 Installation, setup, and database basics (5:09:00) ⬜

```bash
# CLI cheatsheet
psql -U postgres        # connect as superuser (will ask for password)
\l                      # list databases
\dt                     # list tables in current schema
\q                      # quit
```

### 2.3 Creating a new database (5:24:40) ⬜

```sql
CREATE DATABASE task_app;
\c task_app;            -- connect to it
-- DROP DATABASE task_app;  -- careful: destroys everything inside
```

### 2.4 Creating a schema (5:33:50) ⬜

```sql
CREATE SCHEMA app;              -- namespace, like a folder
SET search_path TO app;         -- use it by default
-- or prefix explicitly:  CREATE TABLE app.users (...);
```

### 2.5 Creating a table (5:40:34) ⬜

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,        -- auto-incrementing integer id
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);
-- DROP TABLE users;   TRUNCATE users;   (drop = remove table, truncate = empty it)
```

### 2.6 SQL data types (5:50:11) ⬜

```sql
CREATE TABLE example (
  id SERIAL PRIMARY KEY,
  count INT,                    -- whole numbers
  price NUMERIC(10, 2),         -- exact decimals (money) 12345678.99
  name TEXT,                    -- unlimited-length string
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),  -- timestamp with timezone
  uid UUID                      -- globally unique id
);
```

### 2.7 Other SQL data types (5:59:00) ⬜

```sql
CREATE TYPE mood AS ENUM ('sad', 'ok', 'happy');   -- fixed set of values

ALTER TABLE example ADD COLUMN tags TEXT[];        -- array
ALTER TABLE example ADD COLUMN data JSONB;         -- queryable JSON
ALTER TABLE example ADD COLUMN ip INET;            -- IP address
```

### 2.8 NULL, empty string, and zero values (6:07:29) ⬜

```sql
SELECT NULL = NULL;        -- NULL (not true!) — SQL three-valued logic
SELECT '' = NULL;          -- NULL
SELECT 0 = NULL;           -- NULL

-- correct vs wrong way to test for missing values:
SELECT * FROM users WHERE email IS NULL;   -- correct
SELECT * FROM users WHERE email = NULL;    -- WRONG: always zero rows
```

### 2.9 Constraints (6:15:33) ⬜

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,                 -- must have a value
  title VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- fallback value
  due_date DATE CHECK (due_date > '2020-01-01'),  -- custom rule
  email VARCHAR(255) UNIQUE             -- no duplicates
);
```

### 2.10 Primary key concept (6:25:03) ⬜
- Uniquely identifies each row: `SERIAL PRIMARY KEY` (small, sequential, guessable) vs
  `UUID PRIMARY KEY` (random, unguessable, bigger). Other tables reference it via a foreign key.

### 2.11 SQL concepts base file setup (6:30:12) ⬜

```sql
-- setup.sql: schema + tables + seed data, re-runnable
CREATE SCHEMA IF NOT EXISTS app;
SET search_path TO app;

CREATE TABLE IF NOT EXISTS users (...);
CREATE TABLE IF NOT EXISTS tasks (...);
```

```bash
psql -d task_app -f setup.sql    # run the whole file
```

### 2.12 Insert a single row (6:36:23) ⬜

```sql
INSERT INTO users (name, email) VALUES ('ali', 'ali@x.com') RETURNING *;
-- RETURNING * gives the inserted row back, including the auto id
```

### 2.13 Insert multiple rows (6:41:38) ⬜

```sql
INSERT INTO users (name, email) VALUES
  ('a', 'a@x.com'),
  ('b', 'b@x.com'),
  ('c', 'c@x.com');
```

### 2.14 AND, OR, and NOT filters (6:55:33) ⬜

```sql
SELECT * FROM users WHERE role = 'admin' AND active = true;
SELECT * FROM users WHERE role = 'admin' OR role = 'user';
SELECT * FROM users WHERE NOT active;
-- precedence: NOT > AND > OR — use parentheses when mixing:
SELECT * FROM users WHERE role = 'admin' OR (active = true AND verified = true);
```

### 2.15 LIKE pattern matching (7:03:30) ⬜

```sql
SELECT * FROM users WHERE name LIKE 'a%';         -- starts with 'a'
SELECT * FROM users WHERE name LIKE '%son';       -- ends with 'son'
SELECT * FROM users WHERE name LIKE '%mid%';      -- contains 'mid'
SELECT * FROM users WHERE name LIKE '_li';        -- exactly 1 char + 'li'
SELECT * FROM users WHERE name ILIKE 'ALI';       -- case-insensitive
```

### 2.16 IN, NOT IN, and BETWEEN (7:09:31) ⬜

```sql
SELECT * FROM tasks WHERE status IN ('done', 'in_progress');
SELECT * FROM users WHERE id NOT IN (1, 2, 3);
SELECT * FROM tasks WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';  -- inclusive
```

### 2.17 NULL and NOT NULL (7:16:15) ⬜

```sql
SELECT * FROM tasks WHERE due_date IS NULL;        -- filter on NULLs
SELECT * FROM tasks WHERE due_date IS NOT NULL;
SELECT COALESCE(status, 'none') FROM tasks;        -- first non-NULL value
SELECT NULLIF(a, 0);                               -- NULL when a = 0, else a
```

### 2.18 ORDER BY (7:20:08) ⬜

```sql
SELECT * FROM tasks ORDER BY created_at DESC;      -- newest first
SELECT * FROM users ORDER BY role, name DESC;      -- sort by multiple columns
```

### 2.19 LIMIT, OFFSET, and pagination (7:22:29) ⬜

```sql
SELECT * FROM tasks ORDER BY id LIMIT 10 OFFSET 20;  -- page 3 of 10-per-page
-- high OFFSET scans skipped rows; alternative: WHERE id > last_seen_id
```

### 2.20 Update a single row (7:29:11) ⬜

```sql
UPDATE tasks SET status = 'done' WHERE id = 5 RETURNING *;
-- ALWAYS use WHERE, or you update every row in the table
```

### 2.21 Update multiple rows (7:32:24) ⬜

```sql
UPDATE tasks SET status = 'in_progress' WHERE user_id = 3;
UPDATE tasks SET priority = 'high', notes = '' WHERE status = 'pending';
```

### 2.22 Delete rows (7:36:15) ⬜

```sql
DELETE FROM tasks WHERE id = 5;       -- filtered removal
DELETE FROM tasks;                    -- all rows (same as TRUNCATE but slower + per-row triggers)
TRUNCATE tasks;                       -- fast empty, keeps the table
DROP TABLE tasks;                     -- removes the table itself
```

### 2.23 RETURNING after INSERT, UPDATE, DELETE (7:38:46) ⬜

```sql
INSERT INTO tasks (user_id, title) VALUES (1, 'learn') RETURNING id;
UPDATE tasks SET status = 'done' WHERE id = 1 RETURNING *;
DELETE FROM tasks WHERE id = 1 RETURNING title;   -- see what was removed
-- avoids a second SELECT; used constantly in Node code
```

### 2.24 Relationships and seeding tables/data (7:44:29) ⬜

```sql
-- seed parents first, then children that reference them
INSERT INTO users (id, name, email) VALUES (1, 'ali', 'a@x.com');
INSERT INTO tasks (user_id, title) VALUES
  (1, 'buy milk'),
  (1, 'ship the code');
```

### 2.25 Foreign keys (7:58:23) ⬜

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,  -- delete tasks when user is deleted
  title TEXT NOT NULL
);
-- ON DELETE SET NULL  -> leave the task, set user_id to NULL
-- default NO ACTION   -> block the delete while tasks still reference the user
```

### 2.26 One-to-many relationships (8:02:38) ⬜

```sql
-- one user -> many tasks: the CHILD (tasks) holds the FK (user_id)
SELECT u.name, t.title
FROM users u
JOIN tasks t ON t.user_id = u.id;
```

### 2.27 INNER JOIN (8:09:59) ⬜

```sql
-- only rows with a match on BOTH sides
SELECT u.name, t.title
FROM users u
INNER JOIN tasks t ON t.user_id = u.id;   -- users with no tasks are excluded
```

### 2.28 LEFT JOIN (8:15:05) ⬜

```sql
-- ALL users, even those with zero tasks (NULLs on the right side)
SELECT u.name, COUNT(t.id) AS task_count
FROM users u
LEFT JOIN tasks t ON t.user_id = u.id
GROUP BY u.name;
```

### 2.29 Many-to-many relationships (8:21:03) ⬜

```sql
-- two tables + a junction table holding both foreign keys
CREATE TABLE student_course (
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  course_id  INT REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, course_id)
);

SELECT s.name, c.title
FROM students s
JOIN student_course sc ON sc.student_id = s.id
JOIN courses c        ON c.id = sc.course_id;
```

### 2.30 Table aliases (8:28:28) ⬜

```sql
-- shorter names and self-joins
SELECT u.name AS username, t.title
FROM users AS u
JOIN tasks AS t ON t.user_id = u.id;
```

### 2.31 Aggregate functions (8:34:06) ⬜

```sql
SELECT COUNT(*), SUM(amount), AVG(amount), MIN(amount), MAX(amount)
FROM orders;
-- aggregates ignore NULL (except COUNT(*)); they collapse many rows into one value
```

### 2.32 GROUP BY and HAVING (8:40:49) ⬜

```sql
-- WHERE filters ROWS before grouping; HAVING filters GROUPS after grouping
SELECT status, COUNT(*)
FROM tasks
GROUP BY status;

SELECT status, COUNT(*)
FROM tasks
GROUP BY status
HAVING COUNT(*) > 5;          -- only statuses with more than 5 tasks
```

### 2.33 COUNT DISTINCT (8:48:07) ⬜

```sql
SELECT COUNT(DISTINCT user_id) AS active_users FROM tasks;  -- unique users with tasks
```

### 2.34 Subqueries (8:53:41) ⬜

```sql
SELECT * FROM tasks
WHERE user_id IN (SELECT id FROM users WHERE role = 'admin');

-- often replaceable with a JOIN — know both:
SELECT t.* FROM tasks t
JOIN users u ON u.id = t.user_id
WHERE u.role = 'admin';
```

### 2.35 Indexes: concept only (8:58:00) ⬜

```sql
-- index speeds up WHERE / ORDER BY / JOIN on a column
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- inspect the query plan to see if the index is used
EXPLAIN ANALYZE SELECT * FROM tasks WHERE user_id = 1;
-- trade-off: faster reads, slower writes, extra storage — index only what you filter on
```

### 2.36 Transactions (9:08:18) ⬜

```sql
BEGIN;
INSERT INTO orders (amount) VALUES (100);
UPDATE inventory SET stock = stock - 1 WHERE id = 2;
COMMIT;         -- both succeed together
-- ROLLBACK;    -- OR undo everything if something went wrong (ACID)
```

# Section 3: Express.js & Application Structure (01:33:07)

Practice: `express-app/` (Express 5) with `src/` structure; Postgres + Redis via Docker Compose.

### 3.1 Express setup, Pino logger, folder structure (9:14:05) ⬜

Subtopics: Express = routing + middleware on top of raw `http`. **Express 5 flag**:
`npm install express` gives v5 — route syntax and parser defaults differ from the course's v4.
Pino = fast structured JSON logger.

```bash
npm install express pino pino-http cors dotenv pg
npm install -D typescript tsx @types/node @types/express @types/cors
```

```
src/
  config/       # env, db pool, logger
  db/           # pool + queries / migrations
  middlewares/  # auth, admin, error
  routes/       # user.routes.ts, task.routes.ts
  controllers/  # route handlers
  utils/        # helpers
```

```ts
import express from "express";
import { pino } from "pino";
import { pinoHttp } from "pino-http";

const logger = pino({ level: "info" });   // JSON logs, very fast
const app = express();

app.use(pinoHttp({ logger }));            // log every request
app.use(express.json());                  // parse JSON bodies -> req.body

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(3000, () => logger.info("server on :3000"));
// run with pino-pretty for readable output: node index.js | pino-pretty
```

### 3.2 CORS, Express routing, health route, server setup (9:49:26) ⬜

```ts
import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));  // allow the frontend origin
app.use(express.json());                             // Express 5: req.body is undefined until parsed!

// routing: method + path + handler; :id is a route param
app.get("/api/tasks", (req, res) => res.json({ page: req.query.page ?? 1 }));
app.get("/api/tasks/:id", (req, res) => res.json({ id: req.params.id }));
app.post("/api/tasks", (req, res) => res.status(201).json({ body: req.body }));

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.listen(3000, () => console.log("on :3000"));
```

Express 5 vs 4 quick hits: `/:id?` -> `/{:id}`; `*` -> `*name`; rejected promises in handlers
auto-forward to the error middleware (no `asyncHandler` wrappers needed).

### 3.3 Docker Compose setup, migration creation, SQL table schemas (10:01:13) ⬜

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: task_app
    ports: ["5432:5432"]
    volumes:
      - pgdata:/var/lib/postgresql/data
  redis:
    image: redis:7
    ports: ["6379:6379"]
volumes:
  pgdata:
```

```bash
docker compose up -d     # start everything in the background
docker compose down      # stop (data survives in the volume)
```

Migration `001_init.sql`:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.4 Database migration script implementation (10:16:59) ⬜

```ts
import "dotenv/config";
import { Pool } from "pg";
import { readFile } from "node:fs/promises";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate(): Promise<void> {
  const sql = await readFile("migrations/001_init.sql", "utf8");
  await pool.query(sql);                       // runs the DDL
  console.log("migration applied");
  await pool.end();
}
migrate().catch((err) => { console.error(err); process.exit(1); });
```

### 3.5 Error handler and registration/login flow overview (10:39:53) ⬜

```ts
import express, { type Request, type Response, type NextFunction } from "express";

class AppError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const app = express();
app.use(express.json());

app.get("/boom", () => { throw new AppError(400, "bad thing"); });
// Express 5: rejected promises AND thrown errors both land here automatically

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError)
    return res.status(err.status).json({ message: err.message });
  console.error(err);                          // unexpected -> log + hide details
  res.status(500).json({ message: "Internal Server Error" });
});
```

---

# Section 4: Authentication & Authorization (02:15:46)

Practice: same `express-app/` — auth routes, middleware, and task CRUD.

### 4.1 User registration flow (10:47:12) ⬜

Subtopics: validate input; **hash the password, never store plaintext** (`bcrypt`); handle
duplicate email (UNIQUE -> 409/400). Flag: `bcrypt`/`bcryptjs` both fine; `argon2` is the
modern upgrade.

```ts
import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || password.length < 8)
    return res.status(400).json({ message: "invalid input" });

  const hash = await bcrypt.hash(password, 10);   // 10 salt rounds

  try {
    const { rows } = await pool.query(
      "INSERT INTO users (email, password_hash, name) VALUES ($1,$2,$3) RETURNING id, email",
      [email, hash, name]
    );
    res.status(201).json(rows[0]);
  } catch (err: any) {
    if (err.code === "23505")                       // unique_violation
      return res.status(409).json({ message: "email already registered" });
    throw err;
  }
});
```

### 4.2 User login flow and JWT authentication (11:14:56) ⬜

Subtopics: `bcrypt.compare`; sign a JWT; JWT anatomy header.payload.signature; keep the secret
in `.env`; verify on each request. Flag: `jsonwebtoken` has had CVEs — `jose` is the modern
alternative.

```ts
import jwt from "jsonwebtoken";

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,          // never hardcode; keep in .env
    { expiresIn: "1h" }
  );
  res.json({ token });
});
```

JWT anatomy (a string of 3 dot-separated parts):

```
header.payload.signature
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzAwMDAwfQ.abc123signature
```

### 4.3 Auth/admin middleware and fetching current user (11:33:21) ⬜

```ts
import { type Request, type Response, type NextFunction } from "express";

declare module "express-serve-static-core" {
  interface Request { user?: { id: number; role: string } }
}

function auth(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(" ")[1];   // "Bearer <token>"
  if (!token) return void res.status(401).json({ message: "Unauthorized" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

function admin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== "admin")
    return void res.status(403).json({ message: "Forbidden" });
  next();
}

// compose: [auth, admin] — admin already assumes auth ran first
app.get("/me", auth, (req, res) => res.json(req.user));
app.get("/admin/stats", auth, admin, (req, res) => res.json({ secret: true }));
```

### 4.4 User tasks CRUD implementation (11:48:13) ⬜

Subtopics: every query is user-scoped via `req.user.id`; ownership checks; SQL parameters
(`$1, $2`) never interpolate user input (SQL injection).

```ts
app.post("/tasks", auth, async (req, res) => {
  const { title, description } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO tasks (user_id, title, description) VALUES ($1,$2,$3) RETURNING *",
    [req.user!.id, title, description]
  );
  res.status(201).json(rows[0]);
});

app.get("/tasks", auth, async (req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
    [req.user!.id]
  );
  res.json(rows);
});

app.put("/tasks/:id", auth, async (req, res) => {
  const { rows } = await pool.query(
    "UPDATE tasks SET title = $1, description = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
    [req.body.title, req.body.description, req.params.id, req.user!.id]
  );
  if (!rows[0]) return res.status(404).json({ message: "not found" });  // not yours OR missing
  res.json(rows[0]);
});

app.delete("/tasks/:id", auth, async (req, res) => {
  await pool.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2",
    [req.params.id, req.user!.id]);
  res.status(204).end();
});
```

### 4.5 Admin features: fetch all tasks, search, filter, update status (12:30:12) ⬜

```ts
app.get("/admin/tasks", auth, admin, async (req, res) => {
  const { search, status } = req.query;
  const params: unknown[] = [];
  let sql = "SELECT * FROM tasks WHERE 1=1";       // always-true base

  if (search) { params.push(`%${search}%`); sql += ` AND title ILIKE $${params.length}`; }
  if (status) { params.push(status);      sql += ` AND status = $${params.length}`; }

  sql += " ORDER BY created_at DESC";
  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

app.patch("/admin/tasks/:id/status", auth, admin, async (req, res) => {
  const { rows } = await pool.query(
    "UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *",
    [req.body.status, req.params.id]
  );
  res.json(rows[0]);
});
```

# Section 5: Redis & Caching (02:18:26)

Practice: `express-app/` with the official `redis` v4 client.

### 5.1 Redis introduction (13:02:58) ⬜
- In-memory key-value data store — extremely fast because data lives in RAM, not disk.
- Use cases: caching, rate limiting, queues, pub/sub, sessions.

### 5.2 Project overview (13:05:58) ⬜
- Add to the existing API: caching, rate limiting, and pub/sub notifications.

### 5.3 Installing Redis, what it is, why we need it (13:10:35) ⬜

```bash
docker run -d -p 6379:6379 redis:7     # run Redis in a container
redis-cli ping                         # -> PONG
```

### 5.4 Redis data types (13:18:56) ⬜
- Strings, Hashes, Lists, Sets, Sorted Sets (ZSETs).

### 5.5 Strings (13:19:31) ⬜

```bash
SET greeting hello        # key/value
GET greeting              # hello
MGET a b c                # get many at once
INCR visits               # atomic counter: 1, 2, 3...
SETNX lock 1              # set ONLY if key doesn't exist (locking)
SET token abc123 EX 60    # set with 60s TTL
```

```ts
await client.set("user:1", JSON.stringify(user), { EX: 60 });
const cached = await client.get("user:1");
```

### 5.6 Hashes (13:27:43) ⬜

```bash
HSET user:1 name ali role admin        # object-like storage
HGET user:1 name                       # ali
HGETALL user:1                         # all fields
HINCRBY user:1 points 5                # atomic field counter
```

### 5.7 Lists (13:31:36) ⬜

```bash
LPUSH feed item1          # add to the head
RPUSH feed item2          # add to the tail
LRANGE feed 0 -1          # everything
LPOP feed                 # take from the head
```

### 5.8 Sets (13:35:28) ⬜

```bash
SADD tags node            # unique members only
SADD tags express
SMEMBERS tags             # all members
SISMEMBER tags node       # 1 if present
SREM tags express         # remove
SUNION a b                # union of two sets
```

### 5.9 TTL (Time To Live) (13:43:08) ⬜

```bash
SET code 12345 EX 120     # auto-expire after 120s
EXPIRE session:1 3600     # or set TTL on an existing key
TTL session:1             # seconds left (-2 = gone, -1 = no TTL)
```

### 5.10 Connecting Redis to a Node project (13:47:31) ⬜

```ts
import { createClient } from "redis";

const client = createClient({ url: process.env.REDIS_URL ?? "redis://localhost:6379" });
client.on("error", (err) => console.error("redis error:", err));

await client.connect();
await client.set("k", "v", { EX: 60 });
console.log(await client.get("k"));    // v
```

### 5.11 Redis caching, cache-aside, stale cache, invalidation (13:55:37) ⬜

Pattern: **cache-aside** — check cache -> hit? return. miss? query DB -> store -> return.
**Stale** = data is a snapshot from the past; TTL bounds how stale it gets.
**Invalidation** = delete/update the key on writes so reads don't serve old data.

```ts
async function getBanners() {
  const cached = await client.get("banners");          // 1) check cache
  if (cached) return JSON.parse(cached);               // 2) HIT -> return

  const banners = await pool.query("SELECT * FROM banners");  // 3) MISS -> DB
  await client.set("banners", JSON.stringify(banners), { EX: 60 }); // 4) populate
  return banners;
}

// on any write (create/update/delete banner):
await client.del("banners");                            // invalidation
```

### 5.12 Redis caching example implementation (14:03:08) ⬜
- Standalone demo of 5.11: same read twice — second call is a cache hit (no DB query).

### 5.13 Caching in the Node.js project (14:15:23) ⬜

```ts
// key includes the user so one user's data never leaks to another
const key = `tasks:${req.user.id}`;
const cached = await client.get(key);
if (cached) return res.json(JSON.parse(cached));

const { rows } = await pool.query("SELECT * FROM tasks WHERE user_id = $1", [req.user.id]);
await client.set(key, JSON.stringify(rows), { EX: 60 });
res.json(rows);
// remember: await client.del(key) after create/update/delete
```

### 5.14 Rate limiting with Redis (14:42:53) ⬜

```ts
// fixed window: max 10 requests per IP per minute
app.use(async (req, res, next) => {
  const key = `rate:${req.ip}`;
  const count = await client.incr(key);        // atomic increment
  if (count === 1) await client.expire(key, 60);   // start the 60s window on first hit
  if (count > 10) return res.status(429).json({ message: "Too many requests" });
  next();
});
// off-the-shelf: express-rate-limit with a Redis store
```

### 5.15 Redis Pub/Sub concept and example (14:55:33) ⬜

Subtopics: publisher sends to a **channel**, subscribers receive it (fire-and-forget, no
persistence). Use for notifications / live updates — for durable jobs use BullMQ.

```ts
const sub = createClient();
const pub = createClient();
await sub.connect();
await pub.connect();

await sub.subscribe("notifications", (message) => {
  console.log("received:", message);          // runs in real time
});

await pub.publish("notifications", JSON.stringify({ text: "new task created" }));
```

### 5.16 Redis Pub/Sub in the project (15:07:37) ⬜
- E.g., publish `task.created`; a subscriber logs it or triggers a notification.
- Remember: pub/sub is real-time broadcast, not a reliable queue — that's BullMQ's job (Section 6).

---

# Section 6: File Uploads, Background Jobs & Advanced Integrations (01:28:41)

Practice: `express-app/` + `cloudinary` + `bullmq`.

### 6.1 File upload flow, Cloudinary setup, Multer, Redis Docker Compose (15:21:24) ⬜

Flow: browser sends `multipart/form-data` -> **Multer** parses it -> upload to **Cloudinary** ->
store returned URL in DB. Cloudinary keys live in `.env`. Multer memory storage keeps the file
in RAM (fine for images). Add the `redis` service (5.3) to Docker Compose — BullMQ needs it.

```bash
npm install multer cloudinary
```

```ts
import multer from "multer";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const upload = multer({
  storage: multer.memoryStorage(),                    // keep file in memory
  limits: { fileSize: 5 * 1024 * 1024 },              // 5 MB max
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/"))          // only images
      return cb(new Error("Only images allowed"));
    cb(null, true);
  },
});
```

### 6.2 Upload-to-Cloudinary helper implementation (15:32:51) ⬜

```ts
import type { UploadApiResponse } from "cloudinary";

function uploadToCloudinary(file: Express.Multer.File): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      { folder: "banners", resource_type: "image" },
      (err, result) => (err ? reject(err) : resolve(result!.secure_url))
    );
    stream.end(file.buffer);                          // pipe the buffer into Cloudinary
  });
}
```

### 6.3 Multer middleware and banner create/fetch routes (15:41:29) ⬜

```ts
app.post("/banners", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "image required" });

  const secureUrl = await uploadToCloudinary(req.file);
  const { rows } = await pool.query(
    "INSERT INTO banners (public_id, url) VALUES ($1,$2) RETURNING *",
    [req.file.filename ?? crypto.randomUUID(), secureUrl]
  );
  await client.del("banners");                        // invalidate the cache
  res.status(201).json(rows[0]);
});

app.get("/banners", async (_req, res) => {
  const cached = await client.get("banners");         // cache-aside (5.11)
  if (cached) return res.json(JSON.parse(cached));
  const { rows } = await pool.query("SELECT * FROM banners ORDER BY created_at DESC");
  await client.set("banners", JSON.stringify(rows), { EX: 300 });
  res.json(rows);
});
```

### 6.4 Banner Redis caching, cache-aside, invalidation (16:00:21) ⬜
- Same cache-aside pattern as 5.11: read through cache, invalidate (`del`) on upload.

### 6.5 Deleting Cloudinary images, BullMQ, background jobs, queues, workers (16:10:35) ⬜

```ts
// delete the image from Cloudinary when the banner is removed
await cloudinary.v2.uploader.destroy(publicId);
```

Why background jobs: slow work (image processing, emails, reports) shouldn't block the request.

```ts
import { Queue, Worker } from "bullmq";

const connection = { host: "localhost", port: 6379 };  // Redis is the queue broker

const queue = new Queue("banners", { connection });
await queue.add("resize", { bannerId: 5 });            // enqueue a job

// worker runs in its OWN process (separate script), taking jobs one by one
new Worker("banners", async (job) => {
  console.log("processing", job.name, job.data);
  // do the slow work: resize, generate thumbnails, send email...
}, { connection });
```

Job lifecycle: waiting -> active -> completed/failed. BullMQ retries failed jobs
(`attempts`), supports concurrency, and survives restarts because jobs live in Redis.

### 6.6 Google OAuth login implementation (16:31:19) ⬜

OAuth flow: user -> Google consent screen -> callback with code/token -> verify -> find or
create the user -> issue your own JWT. Libraries: `google-auth-library` (verify ID token) or
Passport + Google strategy.

```bash
npm install google-auth-library
```

```ts
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const google = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post("/auth/google", async (req, res) => {
  const ticket = await google.verifyIdToken({
    idToken: req.body.credential,                 // sent by the frontend after Google login
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload()!;           // email, name, picture

  // find or create the user by payload.email, then sign your own JWT:
  const token = jwt.sign({ email: payload.email }, process.env.JWT_SECRET!, { expiresIn: "1h" });
  res.json({ token, user: { email: payload.email, name: payload.name } });
});
```

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
- [ ] All 36 topics (intro -> transactions)

### Section 3 — Express.js & Application Structure
- [ ] All 5 topics (setup -> error handler)

### Section 4 — Authentication & Authorization
- [ ] All 5 topics (registration -> admin features)

### Section 5 — Redis & Caching
- [ ] All 16 topics (intro -> pub/sub in project)

### Section 6 — Advanced Integrations
- [ ] All 6 topics (file upload -> Google OAuth)

---

*Keep a commit per completed topic so progress is easy to track in `git log`.*




