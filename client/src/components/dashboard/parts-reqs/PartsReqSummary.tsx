import { NovaUser } from "../../../types/kpa/novaUser"
import { TITLES } from "../../../utils/titles"

import { useQueryClient } from "@tanstack/react-query"

import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"
import { styled } from "@mui/material/styles"
import Paper from "@mui/material/Paper"
import Grid from "@mui/material/Unstable_Grid2"
import SummaryTable from "./SummaryTable"
import IconButton from "@mui/material/IconButton"
import RefreshIcon from "@mui/icons-material/Refresh"
import { Typography } from "@mui/material"
import { ALLOWED_GROUPS } from "./lookupTables"

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "#242424",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "left",
    color: "white",
}))

interface Props {
    novaUser: NovaUser
}

export default function PartsReqSummary(props: Props) {
    const { novaUser } = props
    const queryClient = useQueryClient()
    const userType = TITLES.find((item) => item.titles.includes(novaUser.jobTitle))

    const handleRefreshPartsReqs = () => {
        queryClient.refetchQueries({ queryKey: ["partsReq"] })
    }

    return (
        userType &&
        ALLOWED_GROUPS.includes(userType.group) && (
            <Item>
                <Box sx={{ display: "flex", flexDirection: "column"}}>
                    <Box sx={{ display: "flex", flexDirection: "row" }}>
                        <Typography sx={{ margin: "0px 0px 0px 34px", width: "100%", textAlign: "center", fontSize: 24 }}>Parts Requisitions</Typography>
                        <IconButton onClick={handleRefreshPartsReqs} disableRipple size={"small"} sx={{ padding: "0px 5px" }}>
                            <RefreshIcon />
                        </IconButton>
                    </Box>
                    <Divider sx={{ width: "100%", marginBottom: "10px" }} />
                    <Grid
                        container
                        // direction={
                        //     userType.group === "Supply Chain Management" ||
                        //     userType.group === "Ops Vice President" ||
                        //     userType.group === "Admin" ||
                        //     userType.group === "Business Development" ||
                        //     userType.group === "Executive Management" ||
                        //     userType.group === "IT"
                        //         ? "row"
                        //         : "column"
                        // }
                        direction="column"
                    >
                        <SummaryTable novaUser={novaUser} group={userType.group} />
                    </Grid>
                </Box>
            </Item>
        )
    )
}
