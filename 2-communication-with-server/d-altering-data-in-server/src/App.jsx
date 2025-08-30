import React, { useEffect, useState } from 'react'
import Notes from './components/Notes'
import axios from 'axios'
import noteService from './components/services/notes'

const App = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showNotes, setshowNotes] = useState(true)

  // get request to fetch data from json server
  useEffect(() => {
    noteService
      .getAll()
      .then(response => {
        setNotes(response.data)
      })
  }, [])

  // post request to add more data to my json server
  const formHandler = (e) => {
    e.preventDefault()
    const newObj = {
      content: newNote,
      important: Math.random() < 0.5,
    }

    noteService
      .create(newObj)
      .then(response => {
        setNotes(notes.concat(response.data))
      }
      )
  }

  const toggleImportance = (id) => {
    console.log(`importance of id ${id} need to be toggled`);
    const toggler = notes.find(n => n.id === id)
    const changeNote = { ...toggler, important: !toggler.important }

    noteService
      .create(id, changeNote)
      .then(response => {
        setNotes(notes.map(note => note.id === id ? response.data : note))
      })

  }

  //filter to render important notes
  const noteToShow = notes.filter(i => i.important === true)

  return (
    <div>
      <h1>Notes</h1>
      <div>
        <button onClick={() => setshowNotes(!showNotes)}>show {showNotes ? 'important' : 'all'}</button>
      </div>
      <form onSubmit={formHandler}>
        <input onChange={(e) => setNewNote(e.target.value)} value={newNote} type="text" />
        <button type='submit'>add</button>
      </form>

      {
        showNotes ? notes.map((item) => <Notes key={item.id} notes={item.content} toggleImportance={() => toggleImportance(item.id)} />)
          : noteToShow.map((item) => <Notes key={item.id} notes={item.content} toggleImportance={() => toggleImportance(item.id)} />)
      }
    </div>
  )
}

export default App