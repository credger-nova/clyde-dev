import * as React from "react"
import { PartsReq } from "../../../types/partsReq"
import { calcStatusV2, getChartData } from "./dashboardFunctions"
import { REGIONS, chartStyles } from "./lookupTables"
import { Box, Typography} from "@mui/material"
import PartsPieChart from "./PartsPieChart"
import PartsLegend from "./PartsLegend"

interface Props{
    partsReqs: Array<PartsReq>
}

export default function L4(props: Props){
    const {partsReqs} = props
    const pendingApprovalsByRegion: {[key: string]: number} = {}
    for(const region of REGIONS){
        const count = calcStatusV2(partsReqs, "Pending Approval", undefined, undefined, region)
        pendingApprovalsByRegion[region] = count
    }

    const chartData = getChartData(pendingApprovalsByRegion)

    return (
        <Box sx={chartStyles}>
            <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", gap: "4px"}}>
                <Typography variant="h2" sx={{fontSize: "20px", fontWeight: "400"}}>Pending Approvals</Typography>
            </Box>
            <Box sx={{display: "flex", gap: "16px", alignItems: "center"}}>
                <PartsPieChart target='Pending Approval' novaUser={undefined} chartData={chartData} region={undefined} userGroup={undefined} />
                <PartsLegend target='Pending Approval' novaUser={undefined} chartData={chartData} region={undefined} userGroup={undefined} />
            </Box>
        </Box>
    )
}
