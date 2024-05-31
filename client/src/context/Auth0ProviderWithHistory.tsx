import { Auth0Provider, AppState } from "@auth0/auth0-react"
import React from "react"
import { useNavigate } from "react-router-dom"

const Auth0ProviderWithHistory: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate()

    const onRedirectCallback = (appState: AppState | undefined) => {
        navigate(appState?.returnTo || window.location.pathname)
    }

    return (
        <Auth0Provider
            domain={import.meta.env.VITE_AUTH0_DOMAIN}
            clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
            onRedirectCallback={onRedirectCallback}
            authorizationParams={{
                redirect_uri: window.location.origin,
                audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            }}
        >
            {children}
        </Auth0Provider>
    )
}

export default Auth0ProviderWithHistory
