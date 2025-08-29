import React, { useEffect, useState } from 'react'
import Notes from './components/Notes'
import axios from 'axios'

const App = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    axios.get('http://localhost:3001/notes')
      .then(response => {
        setNotes(response.data)
      })
  }, [])

  const formHandler = (e) => {
    e.preventDefault()
    const newObj = {
      content: newNote,
      important: Math.random() < 0.5,
    }
    axios.post('http://localhost:3001/notes', newObj)
      .then(response => {
        setNotes(notes.concat(response.data))
        console.log('notes elements', notes);

      }
      )
  }

  return (
    <div>
      <h1>Notes</h1>
      <form onSubmit={formHandler}>
        <input onChange={(e) => setNewNote(e.target.value)} value={newNote} type="text" />
        <button type='submit'>add</button>
      </form>

      {
        notes.map((item, index) => <Notes key={index} content={item.content} />)
      }

    </div>
  )
}

export default App