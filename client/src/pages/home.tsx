import * as React from "react"

import { useAuth0 } from "@auth0/auth0-react"
import { useNovaUser } from "../hooks/user"

import { TITLES } from "../utils/titles"

import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'
import PartsReqSummary from "../components/dashboard/parts-reqs/PartsReqSummary"

export default function Home() {
    const { user } = useAuth0()
    const { data: novaUser, isFetched } = useNovaUser(user?.email)

    const [userGroup, setUserGroup] = React.useState<string | undefined>()

    React.useEffect(() => {
        if (isFetched && novaUser) {
            setUserGroup(TITLES.find(item => item.titles.includes(novaUser.jobTitle))?.group)
        }
    }, [isFetched, novaUser])

    return (
        <div className="page-container">
            {novaUser &&
                <Box sx={{ width: "100%", height: "100%" }}>
                    <Grid
                        container
                        direction="row"
                    >
                        <Grid
                            xs={12}
                            sm={userGroup === "Supply Chain Management" || userGroup === "Ops Vice President" || userGroup === "Executive Management" ||
                                userGroup === "Admin" || userGroup === "IT" ? 12 : 6}
                            sx={{ padding: "20px" }}>
                            <PartsReqSummary
                                novaUser={novaUser}
                            />
                        </Grid>
                    </Grid>
                </Box>
            }
        </div>
    )
}