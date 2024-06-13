import { PieChart } from "@mui/x-charts/PieChart"
import { useNavigate } from "react-router-dom"
import { navigateToSupplyChain, getPieChartDimensions, getTotalPartsReqs } from "./dashboardFunctions"
import { Box, Link } from "@mui/material"
import { NovaUser } from "../../../types/kpa/novaUser"
import { PieChartSeries } from "./dashboardFunctions"
import useMediaQuery from '@mui/material/useMediaQuery';

interface Props {
    target: string
    chartData: Array<PieChartSeries>
    novaUser: NovaUser
    region: string | undefined
    userGroup: Array<NovaUser> | undefined
}

export default function PartsPieChart(props: Props) {
    const { target, novaUser, chartData, region, userGroup } = props
    const navigate = useNavigate()
    const totalPartsReqs = getTotalPartsReqs(chartData)
    const isMobile = useMediaQuery('(max-width: 400px)')
    const pieChartDimensions = isMobile ? getPieChartDimensions(180): getPieChartDimensions(204)

    return (
        <Box sx={{ position: "relative" }}>
            <PieChart
                //skipAnimation
                width={pieChartDimensions.width}
                height={pieChartDimensions.height}
                series={[
                    {
                        data: chartData,
                        innerRadius: pieChartDimensions.innerRadius,
                        outerRadius: pieChartDimensions.outerRadius,
                        highlightScope: { faded: "global", highlighted: "item" },
                        highlighted: { 
                            innerRadius: pieChartDimensions.innerRadiusHighlighed,
                            outerRadius: pieChartDimensions.outerRadiusHighlighed 
                        },
                        cx: pieChartDimensions.cx,
                        cy: pieChartDimensions.cy,
                    },
                ]}
                slotProps={{ legend: { hidden: true } }}
                onItemClick={(_event, d) => {
                    if(target === 'region'){
                        return navigateToSupplyChain(navigate, chartData[d.dataIndex]["label"], undefined, region)
                    }
                    
                    if(target === 'novaUser'){
                        return navigateToSupplyChain(navigate, chartData[d.dataIndex]["label"], [novaUser])
                    }

                    if(target === 'userGroup'){
                        return navigateToSupplyChain(navigate, chartData[d.dataIndex]["label"], userGroup) 
                    }
                }}
            >
            </PieChart>
            <Link 
                underline={"hover"}
                sx={{
                    position: "absolute", 
                    top: pieChartDimensions.centerTextTop, 
                    left: pieChartDimensions.centerTextLeft, 
                    cursor: "pointer", 
                    textAlign: "center", 
                    width: pieChartDimensions.centerTextWidth
                }}
                onClick={() => {
                    if(target === 'region'){
                        return navigateToSupplyChain(navigate, "Chart Data", undefined, region)
                    }
                    
                    if(target === 'novaUser'){
                        return navigateToSupplyChain(navigate, "Chart Data", [novaUser])
                    }
                    
                    if(target === 'userGroup'){
                        return navigateToSupplyChain(navigate, "Chart Data", userGroup)
                    }
                    
                }}
            >
                Total: <br></br> {totalPartsReqs}
            </Link>
        </Box>
    )
}
