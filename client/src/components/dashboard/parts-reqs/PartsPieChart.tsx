import { PieChart } from "@mui/x-charts/PieChart"
import { useNavigate } from "react-router-dom"
import { navigateToSupplyChain } from "./dashboardFunctions"
import { PieChartSeries } from "./L6PartsReq"
import { Box, Link } from "@mui/material"

interface Props {
    target: string
    chartData: Array<PieChartSeries> 
}

function getTotal(chartData: Array<PieChartSeries>){
    let sum = 0
    for(const data of chartData){
        sum += data.value
    }
    return sum
}



export default function PartsPieChart(props: Props) {
    const { target, chartData } = props
    const navigate = useNavigate()
    const totalPartsReqs = getTotal(chartData)

    return (
        <Box sx={{ position: "relative" }}>
            <PieChart
                width={204}
                height={204}
                series={[
                    {
                        data: chartData,
                        innerRadius: 80,
                        outerRadius: 100,
                        highlightScope: { faded: "global", highlighted: "item" },
                        highlighted: { innerRadius: 80, outerRadius: 102 },
                        cx: 97,
                        cy: 97,
                    },
                ]}
                slotProps={{ legend: { hidden: true } }}
                onItemClick={(_event, d) => {
                    return navigateToSupplyChain(navigate, chartData[d.dataIndex]["label"], undefined, target)   
                }}
            >
            </PieChart>
            <Link 
                underline={"hover"}
                sx={{position: "absolute", top: "82px", left: "51px", cursor: "pointer", textAlign: "center", width: "102px"}}
                onClick={() => {
                    return navigateToSupplyChain(navigate, "Chart Data", undefined, target)
                }}
            >
                Total: <br></br> {totalPartsReqs}
            </Link>
        </Box>
    )
}
