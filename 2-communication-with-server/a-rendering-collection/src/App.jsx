import Notes from "./components/Notes"

function App({ notes }) {

  return (
    <>
      <h1>Notes</h1>
      <ul>
        {notes.map(note => <Notes key={note.id} note={note} />)}
      </ul>
    </>
  )
}

export default App
