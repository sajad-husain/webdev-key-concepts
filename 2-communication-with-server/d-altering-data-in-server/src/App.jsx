import React, { useEffect, useState } from 'react'
import Notes from './components/Notes'
import axios from 'axios'

const App = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showNotes, setshowNotes] = useState(true)

  // get request to fetch data from json server
  useEffect(() => {
    axios.get('http://localhost:3001/notes')
      .then(response => {
        setNotes(response.data)
      })
  }, [])

  // post request to add more data to my json server
  const formHandler = (e) => {
    e.preventDefault()
    const newObj = {
      content: newNote,
      important: Math.random() < 0.5
    }
    axios.post('http://localhost:3001/notes', newObj)
      .then(response => {
        setNotes(notes.concat(response.data))
        console.log('notes elements', notes);

      }
      )
  }
  console.log('notes data', notes);

  const toggleImportance = (id) => {
    console.log(`importance of id ${id} need to be toggled`);
    const url = `http://localhost:3001/notes/${id}`;
    const toggler = notes.find(n => n.id === id)
    const changeNote = { ...toggler, important: !toggler.important }
    axios.put(url, changeNote)
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
        showNotes ? notes.map((item, index) => <Notes key={index} notes={item.content} toggleImportance={() => toggleImportance(item.id)} />)
          : noteToShow.map((item, index) => <Notes key={index} notes={item.content} toggleImportance={() => toggleImportance(item.id)} />)
      }
    </div>
  )
}

export default App