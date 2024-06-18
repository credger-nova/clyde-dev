import * as React from "react"
import { NovaUser } from "../../../types/kpa/novaUser"
import { PartsReqQuery } from "../../../types/partsReq"
import { useLeadsEmployees, useManagersEmployees, useDirectorsEmployees } from "../../../hooks/kpa/user"
import { usePartsReqs } from "../../../hooks/partsReq"
import { useAuth0Token } from "../../../hooks/utils"
import { PERSONNEL_GROUPS} from "./lookupTables"
import L1 from "./L1"
import L2 from "./L2"
import L3 from "./L3"
import L4 from "./L4"
import L5 from "./L5"
import L6 from "./L6"
import { Box, CircularProgress} from "@mui/material"

interface Props {
    novaUser: NovaUser
    group: string
}

export default function SummaryTable(props: Props) {
    const { novaUser, group } = props
    const level = PERSONNEL_GROUPS[group]
    const token = useAuth0Token()  
    const [partsReqQuery] = React.useState<PartsReqQuery>({ user: novaUser })
    const { data: leadsEmployees, isFetching: leadsEmployeesFetching } = useLeadsEmployees(token, novaUser)
    const { data: managersEmployees} = useManagersEmployees(token, novaUser)
    const { data: directorsEmployees} = useDirectorsEmployees(token, novaUser)
    const { data: partsReqs } = usePartsReqs(token, partsReqQuery)

    if(!partsReqs){
        return(
            <Box sx={{display: "flex", justifyContent: "center", height: "180px", width: "360px"}}>
                <CircularProgress size={32} sx={{marginTop: "48px"}} />
            </Box>  
        )
    }

    if (level === "L1" && !leadsEmployeesFetching) {
        return <L1 novaUser={novaUser} leadsEmployees={leadsEmployees} partsReqs={partsReqs}/>
    }
    
    if (level === "L2" && managersEmployees) {
        return <L2 novaUser={novaUser} managersEmployees={managersEmployees} partsReqs={partsReqs}/>
    }
    
    if (level === "L3" && directorsEmployees) {
        return <L3 novaUser={novaUser} directorsEmployees={directorsEmployees} partsReqs ={partsReqs} token={token}/> 
    } 
    
    if (level === "L4") {
        return <L4 partsReqs={partsReqs}/>
    }
    
    if (level === "L5") {
        return <L5 novaUser={novaUser} partsReqs={partsReqs} />
    }
    
    if (level === "L6") {
        return <L6 partsReqs={partsReqs}/>
    }
    
    return (
        <Box sx={{display: "flex", justifyContent: "center", height: "180px", width: "360px"}}>
            <CircularProgress size={32} sx={{marginTop: "48px"}} />
        </Box>  
    )
}
