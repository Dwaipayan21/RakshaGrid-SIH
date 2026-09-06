import React, { useState } from 'react'
import {Icon } from "@iconify/react"
import Map from './components/Map';

const App = () => {
  const[isDark, setIsDark] = useState(false);

  return (
    <main className='w-full h-screen'>
      {/*TODO: Make it in dark mode  */}
      <Map />
    </main>
  )
}

export default App