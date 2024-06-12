import { Box, Link, List, ListItem } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { PieChartSeries } from "./L6PartsReq"
import { navigateToSupplyChain } from "./dashboardFunctions"
interface Props {
    target: string
    chartData: Array<PieChartSeries>
}

export default function PartsLegend(props: Props) {
    const { target, chartData} = props
    const navigate = useNavigate()

    const listItems = chartData.map((listItem) => {

        if(listItem.label === "Units Down"){
            return null
        }

        const markerStylesClosed = {
            height: "16px",
            width: "16px",
            background: "transparent",
        }

        const markerStyles = {height: 16, width: 16, bgcolor: `${listItem.color}`}

        return (
            <ListItem key={listItem.label} sx={{ display: "grid", gridTemplateColumns: "24px 112px 1fr", padding: 0}}>
                <Box sx={listItem.label !== 'Closed' ? markerStyles: markerStylesClosed}></Box>
                <Link
                    underline="hover"
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                        return navigateToSupplyChain(navigate, listItem.label, undefined, target)
                    }}
                >
                    {listItem.label}
                </Link>
                <Box>{listItem.value}</Box>
            </ListItem>
        )
    })

    return (
        <List sx={{display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px", padding: 0}}>
            {listItems}
        </List>
    )
}
