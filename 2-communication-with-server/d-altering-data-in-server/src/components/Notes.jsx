import React from 'react'

const Notes = ({ notes, toggleImportance, deleteNote }) => {
    const label = notes.important ? 'Make note important' : 'make important'
    return (
        <div>
            <li>
                {notes}
                <button onClick={toggleImportance}>{label}</button>
                <button style={{ backgroundColor: 'skyblue', border: 'none', borderRadius: '5px' }} onClick={deleteNote}>delete</button>
            </li>
        </div>
    )
}

export default Notes