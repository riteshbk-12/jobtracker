// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

import {BrowserRouter , Route, Routes} from 'react-router-dom'
import Home from './pages/home'



function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>} />
          {/* <Route path="/about" element={<h1>About Page</h1>} />
          <Route path="/contact" element={<h1>Contact Page</h1>} />
          <Route path="*" element={<h1>404 Not Found</h1>} /> */}
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
