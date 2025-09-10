const express = require('express')
const app = express();

let notes = [
    {
        id: "1",
        content: "HTML is easy",
        important: true
    },
    {
        id: "2",
        content: "Browser can execute only JavaScript",
        important: false
    },
    {
        id: "3",
        content: "GET and POST are the most important methods of HTTP protocol",
        important: true
    }
]

// URL	verb	functionality
// notes / 10	GET	fetches a single resource
// notes	GET	fetches all resources in the collection
// notes	POST	creates a new resource based on the request data
// notes / 10	DELETE	removes the identified resource
// notes / 10	PUT	replaces the entire identified resource with the request data
// notes / 10	PATCH	replaces a part of the identified resource with the request data

app.get('/', (request, response) => {
    response.send('<h1>Hello World From HomPage</h1>')
})

app.get('/api/notes', (request, response) => {
    response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
    const id = request.params.id
    const note = notes.find(note => note.id == id) // finds id which matches  with parameter id
    response.json(note)

    // code added for error handling
    if (note) {
        response.json(note)
    } else {
        response.status(400).end()
    }
})
// node --watch index.js
// this command is used to track automatic change tracking in our app

console.log('automatic tracking is working');


const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)