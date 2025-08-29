import React, { useEffect, useState } from 'react'
import Notes from './components/Notes'
import axios from 'axios'

const App = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState([])

  useEffect(() => {
    axios.get('http://localhost:3001/notes')
      .then(response => {
        setNotes(response.data)
      })
  }, [])

  const formHandler = () => {

  }

  return (
    <div>
      <h1>Notes</h1>
      <form onSubmit={formHandler}>
        <input onChange={(e) => setNewNote(e.target.value)} value={newNote} type="text" />
        <button type='submit'>add</button>
      </form>

      {
        notes.map(item => <Notes key={item.id} content={item.content} />)
      }

    </div>
  )
}

export default App