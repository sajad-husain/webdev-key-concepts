import React from 'react'

const Notes = ({ notes, toggleImportance }) => {
    const label = notes.important ? 'Make note important' : 'make important'
    return (
        <div>
            {notes}
            <button onClick={toggleImportance}>{label}</button>
        </div>
    )
}

export default Notes