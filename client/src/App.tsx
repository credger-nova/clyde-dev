import * as React from "react"

import { Route, Routes } from "react-router-dom"
import Loader from "./components/Loader"
import PrivateRoute from "./components/PrivateRoute"

import './css/app.css'

const Home = React.lazy(() => import("./pages/home"))
const Units = React.lazy(() => import("./pages/units"))

function App() {
  const MyPrivateRoute = PrivateRoute

  return (
    <React.Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={
          <MyPrivateRoute>
            <Home />
          </MyPrivateRoute>
        } />
        <Route path="/units" element={
          <MyPrivateRoute>
            <Units />
          </MyPrivateRoute>
        } />
      </Routes>
    </React.Suspense>
  )
}

export default App
