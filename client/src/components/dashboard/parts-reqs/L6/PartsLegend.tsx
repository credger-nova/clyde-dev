import { Box, Link, List, ListItem } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { PieChartSeries } from "./L6PartsReq"
import { navigateToSupplyChain } from "../dashboardFunctions"
interface Props {
    data: Array<PieChartSeries>
    target: string
    item: string
    isMobile: boolean
}

export default function PartsLegend(props: Props) {
    const { data, target, item, isMobile } = props
    const navigate = useNavigate()

    const listItemsDesktop = data.map((listItem) => {
        return (
            <ListItem key={listItem.label} sx={{ display: "grid", gridTemplateColumns: "32px 160px 32px" }}>
                <Box sx={{ height: 16, width: 16, bgcolor: `${listItem.color}` }}></Box>
                <Link
                    underline="hover"
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                        if (target === "region") {
                            return navigateToSupplyChain(navigate, listItem.label, undefined, item)
                        } else {
                            return navigateToSupplyChain(navigate, item, undefined, listItem.label)
                        }
                    }}
                >
                    {listItem.label}
                </Link>
                <Box>{listItem.value}</Box>
            </ListItem>
        )
    })

    const listItemsMobile = data.map((listItem, i, data) => {
        const borderBottom = i + 1 === data.length ? "1px solid rgba(255,255,255,0.2)" : "none"
        return (
            <ListItem
                key={listItem.label}
                sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 32px 160px 32px 1fr",
                    height: "64px",
                    borderTop: "1px solid rgba(255,255,255,0.2)",
                    borderBottom: { borderBottom },
                    cursor: "pointer",
                }}
                onClick={() => {
                    if (target === "region") {
                        return navigateToSupplyChain(navigate, listItem.label, undefined, item)
                    } else {
                        return navigateToSupplyChain(navigate, item, undefined, listItem.label)
                    }
                }}
            >
                {" "}
                <span></span>
                <Box sx={{ height: 16, width: 16, bgcolor: `${listItem.color}` }}></Box>
                <Box>{listItem.label}</Box>
                <Box>{listItem.value}</Box>
                <span></span>
            </ListItem>
        )
    })

    return <List sx={{ width: "100%", mx: "auto", padding: 0 }}>{isMobile ? listItemsMobile : listItemsDesktop}</List>
}
