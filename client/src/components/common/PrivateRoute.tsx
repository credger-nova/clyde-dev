import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import { useNovaUser } from "../../hooks/kpa/user"
import { useAuth0Token } from "../../hooks/utils"

import { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import Layout from "../layout/Layout"
import Loader from "./Loader"

interface Props {
    children?: ReactNode
    titles?: Array<string>
}

const Route = ({ children, titles }: Props) => {
    const { user } = useAuth0()
    const token = useAuth0Token()

    const { data: novaUser, isFetched } = useNovaUser(token, user?.email)

    if (isFetched) {
        if (novaUser) {
            const canAccess = titles ? titles.includes(novaUser.jobTitle) : true

            return canAccess ? <Layout>{children}</Layout> : <Navigate to="/" /> // TODO: Create an Unauthorized page
        } else {
            return <Navigate to="/login" /> // TODO: Create page to redirect to login
        }
    } else {
        return <Loader />
    }
}

const PrivateRoute = withAuthenticationRequired(Route, {
    onRedirecting: () => <Loader />,
})

export default PrivateRoute
