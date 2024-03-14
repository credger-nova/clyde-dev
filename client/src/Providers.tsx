import * as React from "react"

import Auth0ProviderWithHistory from "./context/Auth0ProviderWithHistory"
import { BrowserRouter as Router } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { UIStateProvider } from "./context/UIContext"
import { ThemeProvider } from "@emotion/react"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import theme from "./css/theme"

const queryClient = new QueryClient()

type Props = {
    children: React.ReactNode
}

export default function Providers({ children }: Props) {
    return (
        <ThemeProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
                <Router>
                    <Auth0ProviderWithHistory>
                        <UIStateProvider>
                            {children}
                            {import.meta.env.DEV && (
                                <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
                            )}
                        </UIStateProvider>
                    </Auth0ProviderWithHistory>
                </Router>
            </QueryClientProvider>
        </ThemeProvider>
    )
}