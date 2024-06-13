import * as React from "react"
import { NovaUser } from "../../../types/kpa/novaUser"
import { TITLES } from "../../../utils/titles"
import { PERSONNEL_GROUPS } from "./lookupTables"
import RegionToggleButton from "./RegionToggleButton"
import { useManagersEmployees } from "../../../hooks/kpa/user"
import { getPartsReqsByUserGroup, getPartsReqsByUser, navigateToSupplyChain, getChartData} from "./dashboardFunctions"
import { Box, Typography, Link } from "@mui/material"
import { PartsReq } from "../../../types/partsReq"
import PartsPieChart from "./PartsPieChart"
import PartsLegend from "./PartsLegend"
import { useNavigate } from "react-router-dom"
import ManagerSwitch from "./ManagerSwitch"

interface Props {
    manager: NovaUser
    token: string
    partsReqs: Array<PartsReq>
}

export default function L3Manager(props: Props){
    const {manager, token, partsReqs} = props
    const navigate = useNavigate()

    const { data: managersEmployees, isFetching: managersEmployeesFetching } = useManagersEmployees(token, manager)
    const userGroup = managersEmployees ? [manager].concat(managersEmployees): [manager]
    const [checked, setChecked] = React.useState(false)
    const data = checked ? getPartsReqsByUser(manager, partsReqs): getPartsReqsByUserGroup(userGroup, partsReqs)
    const chartData = getChartData(data)
    const chartType = checked ? "novaUser": "userGroup"

    return(
        <Box key={manager.id} sx={{background: "#242424", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", width: "fit-content", padding: "16px", borderRadius: "16px"}}>
            <Typography variant="h2" sx={{fontSize: "20px", fontWeight: "400"}}>{manager.firstName} {manager.lastName}</Typography>
            <ManagerSwitch checked={checked} setChecked={setChecked} />
            <Box sx={{display: "flex", gap: "16px"}}>
                <PartsPieChart target={chartType} novaUser={manager} chartData={chartData} region={undefined} userGroup={userGroup} />
                <PartsLegend target={chartType}  novaUser={manager} chartData={chartData} region={undefined} userGroup={userGroup} />
            </Box>
            <Box sx={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                <Link
                    underline="hover"
                    sx={{cursor: "pointer"}}
                    onClick={() => {
                        return navigate("manager", {state: {manager, managersEmployees, partsReqs}})
                    }}
                >
                    View Team
                </Link>
                <Link
                    underline="hover"
                    sx={{cursor: "pointer"}}
                    onClick={() => {
                        return navigateToSupplyChain(navigate, "Closed", userGroup, undefined)
                    }}
                >
                    Closed:&ensp;{data["Closed"]}
                </Link>
            </Box>
        </Box>
    )
}