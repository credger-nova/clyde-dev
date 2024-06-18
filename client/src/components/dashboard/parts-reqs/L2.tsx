import { NovaUser } from "../../../types/kpa/novaUser"
import { PartsReq } from "../../../types/partsReq"
import { getPartsReqsByUser, getPartsReqsByUserGroup, navigateToSupplyChain } from "./dashboardFunctions"
import { Box, Typography, Link } from "@mui/material"
import { getChartData } from "./dashboardFunctions"
import PartsPieChart from "./PartsPieChart"
import PartsLegend from "./PartsLegend"
import { useNavigate } from "react-router-dom"
import ManagerSwitch from "./ManagerSwitch"
import * as React from 'react';
import L1 from "./L1"
import { chartStyles } from "./lookupTables"

interface Props{
    novaUser: NovaUser
    managersEmployees: Array<NovaUser>
    partsReqs: Array<PartsReq> 
}

export default function L2 (props: Props){
    const {novaUser, managersEmployees, partsReqs} = props
    const userGroup = managersEmployees ? [novaUser].concat(managersEmployees): [novaUser]
    const navigate = useNavigate()

    const [checked, setChecked] = React.useState(false)
    const data = checked ? getPartsReqsByUser(novaUser, partsReqs): getPartsReqsByUserGroup(userGroup, partsReqs)
    const chartData = getChartData(data)
    const chartType = checked ? "novaUser": "userGroup"

    const subordinatesCharts = 
        managersEmployees ? 
        managersEmployees.map((employee) => {
            return (
                <L1 key={employee.id} novaUser={employee} partsReqs={partsReqs} userOnly={true} />
            )
        }) :
        null

    return(
        <Box sx={{display: "flex", flexWrap: "wrap", gap: "24px"}}>
            <Box sx={chartStyles}>
                <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", gap: "4px"}}>
                    <Typography variant="h2" sx={{fontSize: "20px", fontWeight: "400"}}>{novaUser.firstName} {novaUser.lastName}</Typography>
                    <ManagerSwitch checked={checked} setChecked={setChecked} />
                </Box>
                <Box sx={{display: "flex", gap: "16px", alignItems: "center"}}>
                    <PartsPieChart target={chartType} novaUser={novaUser} chartData={chartData} region={undefined} userGroup={userGroup} />
                    <PartsLegend target={chartType}  novaUser={novaUser} chartData={chartData} region={undefined} userGroup={userGroup} />
                </Box>
                <Link
                    underline="hover"
                    sx={{cursor: "pointer"}}
                    onClick={() => {
                        return navigateToSupplyChain(navigate, ["Closed"], userGroup, undefined)
                    }}
                >
                    Closed:&ensp;{data["Closed"]}
                </Link>
            </Box>
            {subordinatesCharts}
        </Box>
    )

}