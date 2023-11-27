import { Route, Routes } from 'react-router-dom'
import Units from './pages/units'
import Home from './pages/home'
import './css/app.css'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/units" element={<Units />} />
    </Routes>
  )
}

export default App
