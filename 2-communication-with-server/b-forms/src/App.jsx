import { useState } from "react"
import Notes from "./components/Notes"

function App({ notes }) {
  const [note, setNote] = useState(notes)
  const [newNote, setNewNote] = useState('new note...')
  const [setshowAll, setSetshowAll] = useState(true)

  console.log(note);

  const formHandler = (event) => {
    event.preventDefault()
    console.log("form data ", event.target);
    const newObj = {
      content: newNote,
      important: Math.random() < 0.5,
      id: String(note.length + 1)
    }
    console.log("Object ID", newObj.id);

    const createNote = note.concat(newObj)
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
      <ul>
        {note.map(notelist => <Notes key={notelist.id} note={notelist} />)}
      </ul>
      <form action="" onSubmit={formHandler}>
        <input onChange={noteChangeHandler} value={newNote} />
        <button type="submite">Save</button>
      </form>
    </>
  )
}

export default App
