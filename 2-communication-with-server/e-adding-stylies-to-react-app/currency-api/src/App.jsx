import React, { useEffect, useState } from 'react'

const App = () => {
  const [value, setValue] = useState('')
  const [rates, setRates] = useState({})
  const [currency, setCurrency] = useState(null)

  useEffect(() => {
    console.log('effect run, currency is now', currency);

  }, [])
  return (
    <div>
      <form onSubmit={currencyHandler}>
        Currency: <input
          onChange={e => setValue(e.target.value)}
          value={value}
          type="text" />
        <button type='submit'>Exchange Rates</button>
      </form>
      { }
    </div>
  )
}

export default App