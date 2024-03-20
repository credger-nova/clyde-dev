import { useAuth0 } from "@auth0/auth0-react"
import { useNovaUser } from "../hooks/user"

import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'
import PartsReqSummary from "../components/dashboard/parts-reqs/PartsReqSummary"

export default function Home() {
    const { user } = useAuth0()
    const { data: novaUser } = useNovaUser(undefined, user?.email)

    return (
        <div className="page-container">
            {novaUser &&
                <Box sx={{ width: "100%", height: "100%" }}>
                    <Grid
                        container
                        direction="row"
                    >
                        <Grid xs={12} sm={6} sx={{ padding: "20px" }}>
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