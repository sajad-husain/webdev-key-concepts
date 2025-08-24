import { useEffect, useState } from "react"
import Notes from "./components/Notes"
import axios from "axios"

function App() {
  const [note, setNote] = useState([])
  const [newNote, setNewNote] = useState('new note...')
  const [showAll, setSetshowAll] = useState(true)


  useEffect(() => {
    console.log('effect');
    axios
      .get('http://localhost:3001/notes')
      .then((response) => {
        console.log('promise fulfilled');

        const notes = response.data
        setNote(notes)
      })

  }, [])
  console.log('render', note.length, 'notes');

  const addNote = (event) => {
    event.preventDefault()
    const newObj = {
      content: newNote,
      import: Math.random() < 0.5,
      id: String(note.length + 1)
    }

    axios
      .post('http://localhost:3001/notes', newObj)
      .then(response => {
        setNote(note.concat(response.data))
        setNewNote('')
      })
  }

  const togglingNotes = () => {

  }


  const notesToShow = showAll ?
    note :
    note.filter(n => n.important === true)

  const formHandler = (event) => { //form submission handler
    event.preventDefault()
    console.log("form data ", event.target);
    const newObj = {
      content: newNote,
      important: Math.random() < 0.5,
      id: String(note.length + 1)
    }
    console.log("Object ID", newObj.id);

    const createNote = note.concat(newObj) // input onchange handler
    setNote(createNote)
    setNewNote('')
  }

  const noteChangeHandler = (event) => {
    console.log(event.target.value);
    setNewNote(event.target.value)

  }
  return (
    <>
      <h1>Notes</h1>
      <button onClick={() => setSetshowAll(!showAll)} >show {showAll ? 'important' : 'all'}</button>
      <ul>
        {notesToShow.map(notelist => <Notes key={notelist.id} note={notelist} />)}
      </ul>
      <form action="" onSubmit={formHandler}>
        <input onChange={noteChangeHandler} value={newNote} />
        <button type="submite" >submit</button>
      </form>
    </>
  )
}

export default App
