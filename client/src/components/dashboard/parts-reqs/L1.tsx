import { NovaUser } from "../../../types/kpa/novaUser"
import { Box, Typography, Link } from "@mui/material"
import { getChartData, getPartsReqsByUser } from "./dashboardFunctions"
import { PartsReq } from "../../../types/partsReq"
import PartsPieChart from "./PartsPieChart"
import PartsLegend from "./PartsLegend"
import { navigateToSupplyChain } from "./dashboardFunctions"
import { useNavigate } from "react-router-dom"

interface Props{
    novaUser: NovaUser
    leadsEmployees?: Array<NovaUser> | undefined
    partsReqs: Array<PartsReq>
    userOnly?: boolean
}

export default function L1(props: Props){
    const {novaUser, leadsEmployees, partsReqs, userOnly} = props
    const users = (leadsEmployees && !userOnly) ? [novaUser].concat(leadsEmployees): [novaUser]
    const navigate = useNavigate()

    const cards = users.map((user) => {
        const data = getPartsReqsByUser(user, partsReqs)
        const chartData = getChartData(data)
 
        return (
            <Box key={user.id} sx={{background: "#242424", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", width: "fit-content", padding: "16px", borderRadius: "16px"}}>
                <Typography variant="h2" sx={{fontSize: "20px", fontWeight: "400",}}>{novaUser.firstName} {novaUser.lastName}</Typography>
                <Box sx={{display: "flex", gap: "16px"}}>
                    <PartsPieChart target="novaUser" novaUser={novaUser} chartData={chartData} region={undefined} userGroup={undefined} />
                    <PartsLegend target="novaUser"  novaUser={novaUser} chartData={chartData} region={undefined} userGroup={undefined} />
                </Box>
                <Link
                    underline="hover"
                    sx={{cursor: "pointer"}}
                    onClick={() => {
                        return navigateToSupplyChain(navigate, "Closed", [novaUser], undefined)
                    }}
                >
                    Closed:&ensp;{data["Closed"]}
                </Link>
            </Box>
        )
    })


    return (
        <Box>
            {cards}
        </Box>
        
    )
}