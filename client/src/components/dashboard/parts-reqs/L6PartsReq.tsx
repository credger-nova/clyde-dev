import { Box, Typography, Link } from "@mui/material"
import PartsPieChart from "./PartsPieChart"
import PartsLegend from "./PartsLegend"
import { navigateToSupplyChain } from "./dashboardFunctions"
import { useNavigate } from "react-router-dom"

interface Props {
    key: string
    target: string
    data: { [key: string]: number } 
}

export interface PieChartSeries {
    value: number
    label: string
    color: string
}

const colorPallete = [
    "#ea76cb",
    "#8839ef",
    "#d20f39",
    "#df8e1d",
    "#40a02b",
    "#1e66f5",
    "#acb0be",
    "#dc8a78",
    "#179299",
    "#7287fd",
  ];

export default function L6PartsReq(props: Props) {
    const {target, data} = props
    const navigate = useNavigate()
    console.log('data', data)

    const chartData: Array<PieChartSeries> = []
    let i=0
    for(const [key, value] of Object.entries(data)){
        if(key === "Closed" || key === "Units Down"){
            continue
        }
        const x = {value: value, label: key, color: colorPallete[i]}
        chartData.push(x)
        i++
    }
    console.log(chartData)

    return (
        <Box sx={{ background: "#242424", borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px"}}>
            <Typography variant="h2" sx={{fontSize: '20px', fontWeight: "400", width: "208px", textAlign: "center", marginBottom: "8px"}}>{target}</Typography>
            <Box sx={{display: "flex", gap: "16px", alignItems: "center"}}>
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <PartsPieChart target={target} chartData={chartData}/>
                </Box>
                <PartsLegend target={target} chartData={chartData} />
            </Box>
            <Box sx={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                    <Link
                        underline="hover"
                        sx={{cursor: "pointer"}}
                        onClick={() => {
                            return navigateToSupplyChain(navigate, "Closed", undefined, target)
                        }}
                    >
                        Closed:&ensp;{data["Closed"]}</Link>
                    <Link 
                        underline="hover" 
                        sx={{cursor: "pointer" }}
                        onClick={() => {
                            return navigateToSupplyChain(navigate, "Unit Down", undefined, target)
                        }}
                    >
                        Unit Down:&ensp;{data["Units Down"]}
                    </Link>
            </Box>
        </Box>
    )
}
