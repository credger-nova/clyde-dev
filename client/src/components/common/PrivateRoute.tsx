import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import { useNovaUser } from "../../hooks/user"
import { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import Layout from "../layout/Layout"
import Loader from "./Loader"

interface Props {
    children?: ReactNode
}

const Route = ({ children }: Props) => {
    const { user } = useAuth0()

    const { data: novaUser, isFetched } = useNovaUser(undefined, user?.email)

    return isFetched ?
        novaUser ?
            <Layout>{children}</Layout> :
            <Navigate to="/login" /> :
        <Loader /> // TODO: Create page to redirect to login
}

const PrivateRoute = withAuthenticationRequired(Route, {
    onRedirecting: () => <Loader />
})

export default PrivateRoute