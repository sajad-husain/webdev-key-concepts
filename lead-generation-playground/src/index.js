import express, { urlencoded } from 'express'
const app = express()
const port = 3000

//middleware
app.use(express.json({ limit: "10mb" }))
app.use(urlencoded({ extended: 'true' }))
app.use((req, res, next) => {
    console.log("===REQUEST===");
    console.log('Method', req.method, 'URL', req.url);
    console.log('Content-Type', req.get('Content-Type'));
    console.log('Body', req.body);
    console.log('=============');
    next()
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/users', (req, res) => {
    res.json({ message: "User end point ready for testing post request", method: 'GET' })
})
app.post('/users', (req, res) => {
    const { name, email } = req.body
    console.log("req.body ", req.body)
    console.log("Requsetd body = ", name, email);

    if (!name || !email) {
        return res.status(400).json({ error: "Missing name or email." })
    }
    res.json({ received: { name, email } })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
