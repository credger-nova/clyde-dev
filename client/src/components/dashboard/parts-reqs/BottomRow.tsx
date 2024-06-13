import { Box, Link } from "@mui/material"
import { navigateToSupplyChain } from "./dashboardFunctions"
import { useNavigate } from "react-router-dom"
import { NovaUser } from "../../../types/kpa/novaUser"
import { PartsReq } from "../../../types/partsReq"
import { useManagersEmployees } from "../../../hooks/kpa/user"

interface Props{
    data: { [key: string]: number }
    region: string | undefined
    level: string
    novaUser: NovaUser | undefined
    partsReqs: Array<PartsReq> | undefined
    managersEmployees: Array<NovaUser> | undefined
}

export default function BottomRow(props: Props){
    const {data, region, level, novaUser, partsReqs, managersEmployees} = props
    const navigate = useNavigate()
    console.log('brProps', props)

    if(level === "L1" || level === "L2"){
        return(
            <Box sx={{display: "flex", justifyContent: "center", width: "100%"}}>
                <Link
                    underline="hover"
                    sx={{cursor: "pointer"}}
                    onClick={() => {
                        return navigateToSupplyChain(navigate, "Closed", undefined, region)
                    }}
                >
                    Closed:&ensp;{data["Closed"]}
                </Link>
            </Box>
        )
    }

    if(level === "L3"){
        return(
            <Box sx={{display: "flex", justifyContent: "space-between", width: "100%"}}>
            <Link 
                underline="hover" 
                sx={{cursor: "pointer" }}
                onClick={() => {
                    return navigate("/manager", {state: {novaUser, partsReqs, managersEmployees}})
                }}
            >
                View Team
            </Link>
            <Link
                underline="hover"
                sx={{cursor: "pointer"}}
                onClick={() => {
                    return navigateToSupplyChain(navigate, "Closed", undefined, region)
                }}
            >
                Closed:&ensp;{data["Closed"]}
            </Link>
        </Box>
        )
    }

    if(level === "L5"){
        return null
    } 
    
    if(level === "L6"){
        return(            
            <Box sx={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                <Link 
                    underline="hover" 
                    sx={{cursor: "pointer" }}
                    onClick={() => {
                        return navigateToSupplyChain(navigate, "Unit Down", undefined, region)
                    }}
                >
                    Unit Down:&ensp;{data["Units Down"]}
                </Link>
                <Link
                    underline="hover"
                    sx={{cursor: "pointer"}}
                    onClick={() => {
                        return navigateToSupplyChain(navigate, "Closed", undefined, region)
                    }}
                >
                    Closed:&ensp;{data["Closed"]}
                </Link>
            </Box>
        )
    } 
}