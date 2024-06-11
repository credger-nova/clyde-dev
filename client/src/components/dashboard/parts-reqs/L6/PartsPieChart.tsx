import { PieChart } from "@mui/x-charts/PieChart"
import { useNavigate } from "react-router-dom"
import { navigateToSupplyChain } from "../dashboardFunctions"
import { PieChartSeries } from "./L6PartsReq"
import { Box, Link } from "@mui/material"

function getTotalParts(data: Array<PieChartSeries>) {
    let sum = 0
    for (let i = 0; i < data.length; i++) {
        sum += data[i].value
    }
    return sum
}

interface Props {
    target: string
    item: string
    data: Array<PieChartSeries>
    isMobile: boolean
}

export default function PartsPieChart(props: Props) {
    const { target, item, data, isMobile } = props
    const total = getTotalParts(data)
    const navigate = useNavigate()

    return (
        <Box sx={{ position: "relative" }}>
            <PieChart
                width={320}
                height={320}
                series={[
                    {
                        data,
                        innerRadius: 120,
                        outerRadius: 148,
                        highlightScope: { faded: "global", highlighted: "item" },
                        highlighted: { innerRadius: 120, outerRadius: 150 },
                        cx: 160,
                        cy: 160,
                    },
                ]}
                slotProps={{ legend: { hidden: true } }}
                onItemClick={(_event, d) => {
                    if (target === "region") {
                        return navigateToSupplyChain(navigate, data[d.dataIndex]["label"], undefined, item)
                    } else {
                        return navigateToSupplyChain(navigate, item, undefined, data[d.dataIndex]["label"])
                    }
                }}
            >
            </PieChart>
            <Link 
                underline={isMobile ? "always" : "hover"}
                sx={{ position: "absolute", top: "150px", left: "110px", width: "100px", fontSize: 20, textAlign: "center", cursor: "pointer"}}
                onClick={() => {
                    if(target === 'region'){
                      return navigateToSupplyChain(navigate, undefined, undefined, item)
                    } else{
                        return navigateToSupplyChain(navigate, item)
                    }
                  }}
            >
                Total: {total}
            </Link>
        </Box>
    )
}
