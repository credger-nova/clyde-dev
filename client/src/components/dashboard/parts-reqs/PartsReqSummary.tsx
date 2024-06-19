import * as React from "react"
import { NovaUser } from "../../../types/kpa/novaUser"
import { TITLES } from "../../../utils/titles"
import { useQueryClient } from "@tanstack/react-query"
import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"
import SummaryTable from "./SummaryTable"
import IconButton from "@mui/material/IconButton"
import RefreshIcon from "@mui/icons-material/Refresh"
import { Typography } from "@mui/material"
import { ALLOWED_GROUPS } from "./lookupTables"
import theme from "../../../css/theme"

interface Props {
    novaUser: NovaUser | undefined
}

export default function PartsReqSummary(props: Props) {
    const { novaUser } = props
    const queryClient = useQueryClient()

    if(!novaUser){
        return null
    }

    const userType = TITLES.find((item) => item.titles.includes(novaUser.jobTitle))

    const handleRefreshPartsReqs = () => {
        queryClient.refetchQueries({ queryKey: ["partsReq"] })
    }

    return (
        userType &&
        ALLOWED_GROUPS.includes(userType.group) && (
            <Box sx={{
                background: "#323232",
                fontFamily: theme.typography.fontFamily,
                width: "fit-content", 
                height: "fit-content",
                padding: "16px 24px", 
                margin: "16px 32px", 
                borderRadius: "8px"}}        
            >
                <Box sx={{position: "relative", textAlign: "center"}}>
                    <Typography sx={{fontSize: "24px"}}>
                        Parts Requisitions
                    </Typography>
                    <IconButton  className="scaleOnClick" onClick={handleRefreshPartsReqs} disableRipple size={"small"} sx={{ position: "absolute", top: "0px", right: "5px" }}>
                        <RefreshIcon />
                    </IconButton>
                </Box>
                <Divider sx={{margin: "8px 0 16px 0" }} />
                <SummaryTable novaUser={novaUser} group={userType.group} />
            </Box>
        )
    )
}
