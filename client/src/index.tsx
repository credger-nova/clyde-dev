import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import Providers from "./Providers.tsx"

import "./css/index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Providers>
            <App />
        </Providers>
    </React.StrictMode>
)
