import React, { useState } from 'react'

const App = () => {
  const [value, setValue] = useState('')
  const [rates, setRates] = useState({})
  const [currency, setCurrency] = useState(null)


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