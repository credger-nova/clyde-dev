import * as React from "react"

import { Routes, Route } from "react-router-dom"
import Loader from "./components/common/Loader"
import PrivateRoute from "./components/common/PrivateRoute"

import "./css/app.css"
import TestingSplashPage from "./pages/testing-splash"

const Home = React.lazy(() => import("./pages/home"))
const Units = React.lazy(() => import("./pages/units"))
const Map = React.lazy(() => import("./pages/map"))
const SupplyChain = React.lazy(() => import("./pages/supply-chain"))
const Forms = React.lazy(() => import("./pages/forms"))

function getTestingSplash() {
    const testSplash = sessionStorage.getItem("showTestingSplash")

    if (testSplash === "false") {
        return false
    } else {
        return true
    }
}

export default function App() {
    const [showTestingSplashScreen, setShowTestingSplashScreen] = React.useState<boolean>(
        import.meta.env.VITE_ENV === "test" ? getTestingSplash() : false
    )

    return showTestingSplashScreen ? (
        <PrivateRoute>
            <TestingSplashPage setShowTestingSplashScreen={setShowTestingSplashScreen} />
        </PrivateRoute>
    ) : (
        <React.Suspense fallback={<Loader />}>
            <Routes>
                <Route
                    path=""
                    element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="units"
                    element={
                        <PrivateRoute titles={["Software Developer"]}>
                            <Units />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="map"
                    element={
                        <PrivateRoute>
                            <Map />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="supply-chain/*"
                    element={
                        <PrivateRoute>
                            <SupplyChain />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="forms/*"
                    element={
                        <PrivateRoute>
                            <Forms />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </React.Suspense>
    )
}
