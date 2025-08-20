import { useState } from "react"
import Notes from "./components/Notes"

function App({ notes }) {
  const [note, setNote] = useState(notes)
  return (
    <>
      <h1>Notes</h1>
      <ul>
        {note.map(notelist => <Notes key={notelist.id} note={notelist} />)}
      </ul>
    </>
  )
}

export default App
