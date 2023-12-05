import * as React from "react"

import Auth0ProviderWithHistory from "./context/Auth0ProviderWithHistory"
import { BrowserRouter as Router } from "react-router-dom"
import { UIStateProvider } from "./context/UIContext"
import { ThemeProvider } from "@emotion/react"

import theme from "./css/theme"

type Props = {
    children: React.ReactNode
}

export default function Providers({ children }: Props) {
    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Auth0ProviderWithHistory>
                    <UIStateProvider>
                        {children}
                    </UIStateProvider>
                </Auth0ProviderWithHistory>
            </Router>
        </ThemeProvider>
    )
}