import * as React from "react"
import { Box, Link, List, ListItem } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { navigateToSupplyChain, PieChartSeries } from "./dashboardFunctions"
import { NovaUser } from "../../../types/kpa/novaUser"
interface Props {
    target: string
    chartData: Array<PieChartSeries>
    novaUser: NovaUser | undefined
    region: string | undefined
    userGroup : Array<NovaUser> | undefined
}

export default function PartsLegend(props: Props) {
    const {target, chartData, novaUser, region, userGroup} = props
    const navigate = useNavigate()

    const listItems = chartData.map((listItem) => {
        return (
            <ListItem key={listItem.label} sx={{ display: "grid", gridTemplateColumns: "24px 112px 1fr", padding: 0}}>
                <Box sx={{height: "16px", width: "16px", bgcolor: `${listItem.color}`}}></Box>
                <Link
                    underline="hover"
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                        if(target === 'region' || target === "supplyChain"){
                            return navigateToSupplyChain(navigate, [listItem.label], undefined, region)
                        }
                        
                        if(target === 'novaUser' && novaUser){
                            return navigateToSupplyChain(navigate, [listItem.label], [novaUser])
                        }

                        if(target === 'userGroup'){
                            return navigateToSupplyChain(navigate, [listItem.label], userGroup )
                        }
                        if(target === 'Pending Approval'){
                            return navigateToSupplyChain(navigate, ["Pending Approval"], undefined, listItem.label)
                        }

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
