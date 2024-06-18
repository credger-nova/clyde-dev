import * as React from "react"
import { chartStyles } from "./lookupTables"
import { PartsReq } from "../../../types/partsReq"
import { getChartData, getPartsByRegion } from "./dashboardFunctions"
import { Box, Typography} from "@mui/material"
import PartsPieChart from "./PartsPieChart"
import PartsLegend from "./PartsLegend"
import { NovaUser } from "../../../types/kpa/novaUser"

interface Props{
    novaUser: NovaUser
    partsReqs: Array<PartsReq>
}

export default function L5(props: Props){
    const {novaUser, partsReqs} = props
    const statusGroups = ["Pending Quote", "Approved", "Sourcing", "Parts Ordered", "Parts Staged"]
    const regions = novaUser.region
    const partsByRegion = getPartsByRegion(regions, statusGroups, partsReqs)
    const charts = regions.map((region) => {
        const chartData = getChartData(partsByRegion[region])
        return(
            <Box key={region} sx={chartStyles}>
                <Typography variant="h2" sx={{fontSize: "20px", fontWeight: "400",}}>{region}</Typography>
                <Box sx={{display: "flex", gap: "16px", alignItems: "center"}}>
                    <PartsPieChart target="supplyChain" novaUser={undefined} chartData={chartData} region={region} userGroup={undefined} />
                    <PartsLegend target="supplyChain"  novaUser={undefined} chartData={chartData} region={region} userGroup={undefined} />
                </Box>
            </Box>
        )
    })

    return (
        <Box sx={{display: "flex", flexWrap: "wrap", gap: "24px"}}>
            {charts}
        </Box>
    )
}