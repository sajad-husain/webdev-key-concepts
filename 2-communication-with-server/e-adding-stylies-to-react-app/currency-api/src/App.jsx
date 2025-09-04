import React from 'react'

const App = () => {
  return (
    <div>
      <form onSubmit={currencyHandler}>
        Currency: <input type="text" />
        <button type='submit'>Exchange Rates</button>
      </form>
      { }
    </div>
  )
}

export default App