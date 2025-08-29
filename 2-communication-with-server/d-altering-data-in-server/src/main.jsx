import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import axios from 'axios'

// const promise = axios
//   .get('http://localhost:3001/notes')
//   .then(res => {
//     const notes = res.data
//     console.log("value form promise 1 actual promise", notes);
//     ReactDOM.createRoot(document.getElementById('root')).render(
//       <App notes={notes} />
//     )

//   }
//   )
// console.log(promise);
// promise.then("promise.then", res => console.log(res))

// const promise2 = axios.get('http://localhost:3001/foobar')
// console.log("promise 2 value", promise2);

const notes = [
  {
    id: 1,
    content: 'HTML is easy',
    important: true
  },
  {
    id: 2,
    content: 'Browser can execute only JavaScript',
    important: false
  },
  {
    id: 3,
    content: 'GET and POST are the most important methods of HTTP protocol',
    important: true
  }
]

createRoot(document.getElementById('root')).render(
  <App notes={notes} />
)
