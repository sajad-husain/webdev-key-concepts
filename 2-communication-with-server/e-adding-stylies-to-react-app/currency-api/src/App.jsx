import React, { useEffect, useState } from 'react'
import axios from 'axios'

const App = () => {
  const [value, setValue] = useState('')
  const [rates, setRates] = useState({})
  const [currency, setCurrency] = useState(null)

  useEffect(() => {
    console.log('effect run, currency is now', currency);

    axios.get(`https://open.er-api.com/v6/latest/${currency}`)
      .then(response => setRates(response.data.rates))

  }, [currency])
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