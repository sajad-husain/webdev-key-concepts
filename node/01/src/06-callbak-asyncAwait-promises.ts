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

