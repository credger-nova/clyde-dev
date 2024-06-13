import { Box, Typography, Switch } from "@mui/material"
import PartsPieChart from "./PartsPieChart"
import PartsLegend from "./PartsLegend"
import { NovaUser } from "../../../types/kpa/novaUser"
import BottomRow from "./BottomRow"
import { tolColorPallete } from "./lookupTables"
import { PartsReq } from "../../../types/partsReq"
import ManagerSwitch from "./ManagerSwitch"
interface Props {
    target: string
    data: { [key: string]: number }
    novaUser: NovaUser
    region: string | undefined
    level: string
    userGroup: Array<NovaUser> | undefined
    partsReqs: Array<PartsReq> | undefined
    managersEmployees: Array<NovaUser> | undefined
    key?: string | number
}

export interface PieChartSeries {
    value: number
    label: string
    color: string
}

export default function L6PartsReq(props: Props) {
    const {target, data, novaUser, region, level, userGroup, partsReqs, managersEmployees} = props

    const chartData: Array<PieChartSeries> = []
    let i=0
    for(const [key, value] of Object.entries(data)){
        if(key === "Closed" || key === "Units Down"){
            continue
        }
        const x = {value: value, label: key, color: tolColorPallete[i]}
        chartData.push(x)
        i++
    }

    let title
    if(target === 'region'){
        title = region
    } else if(target === 'novaUser'){
        title = novaUser.firstName + ' ' + novaUser.lastName
    } else if(target === 'novaUser && subordinates'){
        title = novaUser.firstName + ' ' + novaUser.lastName + '\'s Team'
    }

    return (
        <Box sx={{ background: "#242424", borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", width: "fit-content"}}>
            <Box>
                <Typography variant="h2" sx={{fontSize: '20px', fontWeight: "400", width: "208px", textAlign: "center", marginBottom: "8px"}}>{title}</Typography>
                <ManagerSwitch level={level} novaUser={novaUser}/>
            </Box>
            <Box sx={{display: "flex", gap: "16px", alignItems: "center"}}>
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <PartsPieChart target={target} chartData={chartData} novaUser={novaUser} region={region} userGroup={userGroup}/>
                </Box>
                <PartsLegend target={target} chartData={chartData} novaUser={novaUser} region={region} userGroup={userGroup} />
            </Box>
            <BottomRow data={data} region={region} level={level} novaUser={novaUser} partsReqs={partsReqs} managersEmployees={managersEmployees} />
        </Box>
    )
}
