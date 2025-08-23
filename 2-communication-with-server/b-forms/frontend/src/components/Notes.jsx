import React from 'react'

const Notes = ({ note }) => {
    return (
        <div>
            <li>{note.content}</li>
        </div>
    )
}

export default Notes