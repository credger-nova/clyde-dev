import * as React from "react"
import { REGIONS, STATUS_GROUPS } from "./lookupTables"
import { PartsReq } from "../../../types/partsReq"
import { getChartData, getPartsByRegion, navigateToSupplyChain} from "./dashboardFunctions"
import { Box, Typography, Link} from "@mui/material"
import PartsPieChart from "./PartsPieChart"
import PartsLegend from "./PartsLegend"
import { useNavigate } from "react-router-dom"
import { chartStyles } from "./lookupTables"

interface Props{
    partsReqs: Array<PartsReq>
}

export default function L6(props: Props){
    const {partsReqs} = props
    
    const navigate = useNavigate()
    const statusGroups = STATUS_GROUPS.concat(["Unit Down"])
    const partsReqsByRegion = getPartsByRegion(REGIONS, statusGroups, partsReqs)
    const charts = REGIONS.map((region) => {
        const chartData = getChartData(partsReqsByRegion[region])

        return(
            <Box 
                key={region} 
                sx={chartStyles}
            >
                <Typography variant="h2" sx={{fontSize: "20px", fontWeight: "400",}}>{region}</Typography>
                <Box sx={{display: "flex", gap: "16px", alignItems: "center"}}>
                    <PartsPieChart target="region" novaUser={undefined} chartData={chartData} region={region} userGroup={undefined} />
                    <PartsLegend target="region"  novaUser={undefined} chartData={chartData} region={region} userGroup={undefined} />
                </Box>
                <Box sx={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                <Link 
                    underline="hover" 
                    sx={{cursor: "pointer" }}
                    onClick={() => {
                        return navigateToSupplyChain(navigate, ["Unit Down"], undefined, region)
                    }}
                >
                    Unit Down:&ensp;{partsReqsByRegion[region]["Unit Down"]}
                </Link>
                <Link
                    underline="hover"
                    sx={{cursor: "pointer"}}
                    onClick={() => {
                        return navigateToSupplyChain(navigate, ["Closed"], undefined, region)
                    }}
                >
                    Closed:&ensp;{partsReqsByRegion[region]["Closed"]}
                </Link>
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