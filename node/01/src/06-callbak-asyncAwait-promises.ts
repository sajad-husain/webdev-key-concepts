// ============================================================
// Async fundamentals — callbacks, promises, async/await
// Started: 2026-08-15   Finished: 2026-09-20
// ============================================================

type User = {id: number,  name: string, role: "user" | "admin"}

const users: User[] = [
    {id: 1, name: 'shehzad', role: 'user'}, 
    {id: 2, name: 'ali', role: 'admin'}, 
    {id: 3, name: 'faizan', role: 'user'}, 
    ]

console.log(users.map(item => item.name))
console.log(users.map(item => item.id))
console.log(users.map(item => item.role))

// ============================================================
// callbacks — a function handed to another so it runs AFTER async work
// error-first convention: cb(err, result) => check err BEFORE using result
// ============================================================

function getUserById(id: number, cb: (err: Error | null, user?: User) => void): void {
    setTimeout(() => {
        if (id <= 0) return cb(new Error(`invalid id: ${id}`));
        const user = users.find((u) => u.id === id);
        if (!user) return cb(new Error(`user not found: ${id}`));
        cb(null, user);
    }, 300);
}

getUserById(1, (err, user) => {
    if (err) return console.error("callback ->", err.message);
    console.log("callback -> user found:", user);
});

// CALLBACK HELL — sequential async steps grow sideways into a pyramid:
getUserById(1, (e1, first) => {
    if (e1) return console.error("1 ->", e1.message);
    getUserById(2, (e2, second) => {
        if (e2) return console.error("2 ->", e2.message);
        getUserById(3, (e3, third) => {
            if (e3) return console.error("3 ->", e3.message);
            console.log("callback hell ->", [first, second, third]);
        });
    });
});

// ============================================================
// promises — pending -> fulfilled | rejected (escaping the pyramid)
// ============================================================

function getUserPromise(id: number): Promise<User> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (id <= 0) return reject(new Error(`invalid id: ${id}`));
            const user = users.find((u) => u.id === id);
            if (!user) return reject(new Error(`user not found: ${id}`));
            resolve(user);
        }, 300);
    });
}

getUserPromise(1)
    .then((user) => console.log("promise ->", user))
    .catch((err) => console.error("promise ->", err.message))
    .finally(() => console.log("promise -> settled"));

// run independent calls in parallel and wait for all of them
Promise.all([getUserPromise(1), getUserPromise(2)])
    .then(([a, b]) => console.log("Promise.all ->", a.name, "+", b.name));

// first one to settle wins — handy as a timeout guard
const timeout = (ms: number): Promise<never> =>
    new Promise((_, reject) => setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms));

Promise.race([getUserPromise(3), timeout(1000)])
    .then((user) => console.log("Promise.race ->", user))
    .catch((err) => console.error("Promise.race ->", err.message));

// util.promisify turns an error-first callback function into a promise one
import { promisify } from "node:util";

const getUserPromisified = promisify(getUserById) as (id: number) => Promise<User>;
getUserPromisified(2)
    .then((user) => console.log("promisify ->", user))
    .catch((err) => console.error("promisify ->", err.message));

// ============================================================
// async/await — reads like sync code, never blocks the event loop
// ============================================================

async function main(): Promise<void> {
    try {
        const user = await getUserPromise(1);
        console.log("async/await -> user:", user);

        // parallel work: await the whole Promise.all batch once
        const [a, b] = await Promise.all([getUserPromise(2), getUserPromise(3)]);
        console.log("async/await -> parallel:", [a, b]);

        // any rejection anywhere jumps straight to catch
        await getUserPromise(-1);
    } catch (err) {
        console.error("async/await -> failed:", (err as Error).message);
    }
}

main();

