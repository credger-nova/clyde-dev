import { Route, Routes } from 'react-router-dom'
import Units from './pages/units'
import './App.css'

function App() {

  return (
    <>
      <div>
        <Routes>
          <Route path="/units" element={<Units />} />
        </Routes>
      </div>
    </>
  )
}

export default App
