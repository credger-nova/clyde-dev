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
import L3Manager from "./L3Manager"

interface Props {
    novaUser: NovaUser
    directorsEmployees: Array<NovaUser>
    partsReqs: Array<PartsReq> 
    token: string
}

export default function L3(props: Props){
    const {novaUser, directorsEmployees, partsReqs, token} = props
    const [region, setRegion] = React.useState(novaUser.region[0])

    const managers: {[key: string]: Array<NovaUser>} = {}
    for(const region of novaUser.region){
        managers[region]= []
        for(const employee of directorsEmployees ){
            const userType = TITLES.find((item) => item.titles.includes(employee.jobTitle))
            if(!userType){
                break
            }
            if(PERSONNEL_GROUPS[userType.group] === "L2" && employee.region.includes(region)){
                managers[region].push(employee)
            }
        }
    }

    const managerCharts = managers[region].map((manager) => {
        return <L3Manager key={manager.id} manager={manager} token={token} partsReqs={partsReqs}/>
    })

    return (
        <Box sx={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "32px"}}>
            <RegionToggleButton regions={novaUser.region} region={region} setRegion={setRegion} />
            {managerCharts}
        </Box>
        
    )
}