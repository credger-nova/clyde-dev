import * as React from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { useNovaUser } from "../hooks/kpa/user"
import { useAuth0Token } from "../hooks/utils"
import Box from "@mui/material/Box"
import PartsReqSummary from "../components/dashboard/parts-reqs/PartsReqSummary"

export default function Home() {
    const { user } = useAuth0()
    const token = useAuth0Token()
    const { data: novaUser} = useNovaUser(token, user?.email)

    return (
        <Box className="page-container">
            <PartsReqSummary novaUser={novaUser} />
        </Box>
    )
}
