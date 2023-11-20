import './App.css'
import { Route, Routes } from 'react-router-dom'
import Units from './pages/units'
import Home from './pages/home'

function App() {

  return (
    <>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/units" element={<Units />} />
        </Routes>
      </div>
    </>
  )
}

export default App
