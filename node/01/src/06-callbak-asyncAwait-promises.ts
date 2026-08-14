type User = {id: number,  name: string, role: "user" | "admin"}

const users: User[] = [
    {id: 1, name: 'shehzad', role: 'user'}, 
    {id: 2, name: 'ali', role: 'admin'}, 
    {id: 3, name: 'faizan', role: 'user'}, 
    ]

console.log(users.map(item => item.name))
console.log(users.map(item => item.id))
console.log(users.map(item => item.role))

