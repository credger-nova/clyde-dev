import * as React from "react"

import { Routes, Route } from "react-router-dom"
import Loader from "./components/common/Loader"
import PrivateRoute from "./components/common/PrivateRoute"

import './css/app.css'

const Home = React.lazy(() => import("./pages/home"))
const Units = React.lazy(() => import("./pages/units"))
const Map = React.lazy(() => import("./pages/map"))
const SupplyChain = React.lazy(() => import("./pages/supply-chain"))
const Forms = React.lazy(() => import("./pages/forms"))

export default function App() {
  return (
    <React.Suspense fallback={<Loader />}>
      <Routes>
        <Route path="" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="units" element={
          <PrivateRoute
            titles={["Software Developer"]}
          >
            <Units />
          </PrivateRoute>
        } />
        <Route path="map" element={
          <PrivateRoute
            titles={["Software Developer"]}
          >
            <Map />
          </PrivateRoute>
        } />
        <Route path="supply-chain" element={
          <PrivateRoute>
            <SupplyChain />
          </PrivateRoute>
        } />
        <Route path="forms/*" element={
          <PrivateRoute>
            <Forms />
          </PrivateRoute>
        } />
      </Routes>
    </React.Suspense>
  )
}
