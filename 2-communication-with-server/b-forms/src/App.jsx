import { useState } from "react"
import Notes from "./components/Notes"

function App({ notes }) {
  const [note, setNote] = useState(notes)

  const formHandler = (event) => {
    event.preventDefault()
    console.log("form data ", event.target);


  }
  return (
    <>
      <h1>Notes</h1>
      <ul>
        {note.map(notelist => <Notes key={notelist.id} note={notelist} />)}
      </ul>
      <form action="" onSubmit={formHandler}>
        <input />
        <button type="submite">Submit</button>
      </form>
    </>
  )
}

export default App
