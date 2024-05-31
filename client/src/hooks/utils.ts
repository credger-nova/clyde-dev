import * as React from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { useLocation } from "react-router-dom"
import { UIContext } from "../context/UIContext"

export const useQueryParams = () => new URLSearchParams(useLocation().search)

export const useAuth0Token = () => {
    const [token, setToken] = React.useState("")
    const { getAccessTokenSilently } = useAuth0()

    React.useEffect(() => {
        (async () => {
            const tkn = await getAccessTokenSilently({
                authorizationParams: {
                    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                },
            })
            setToken(tkn)
        })()
    }, [getAccessTokenSilently])

    return token
}

export const useUIState = () => {
    const context = React.useContext(UIContext)
    if (context === undefined) {
        throw new Error("useUIState must be used within a UIStateProvider")
    }
    return context
}
