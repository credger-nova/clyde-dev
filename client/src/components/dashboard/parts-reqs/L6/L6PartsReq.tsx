import * as React from "react"
import { Box, Link } from "@mui/material"
import TargetToggleButton from "./TargetToggleButton"
import PartsPieChart from "./PartsPieChart"
import PartsLegend from "./PartsLegend"
import TargetDropdownMenu from "./TargetDropdownMenu"
import { toTitleCase } from "../../../../utils/helperFunctions"
import { STATUS_GROUPS } from "../lookupTables"
import { useNavigate } from "react-router-dom"
import { calcUnitDownV2, navigateToSupplyChain } from "../dashboardFunctions"
import { PartsReq } from "../../../../types/partsReq"
import { useMediaQuery } from "@mui/material"

interface Props {
    regionsUpperCase: Array<string>
    partsByRegion: { [key: string]: { [key: string]: number } }
    partsByStatus: { [key: string]: { [key: string]: number } }
    partsReqs: Array<PartsReq>
}

export interface PieChartSeries {
    value: number
    label: string
    color: string
}

const colorPallete = ["#04a5e5", "#ea76cb", "#d20f39", "#40a02b", "#df8e1d", "#8839ef", "#dd7878", "#1e66f5"]

export default function AdminPartsReq(props: Props) {
    const { regionsUpperCase, partsByRegion, partsByStatus, partsReqs } = props
    const statusList = STATUS_GROUPS
    const regionList = regionsUpperCase.map((region: string) => {
        return toTitleCase(region)
    })
    const navigate = useNavigate()

    const [target, setTarget] = React.useState("region")
    const [menu, setMenu] = React.useState(regionList)
    const [item, setItem] = React.useState(regionList[0])

    let unitsDown: number = -999
    if (target === "region") {
        unitsDown = calcUnitDownV2(partsReqs, item)
    } else if (target === "status") {
        unitsDown = calcUnitDownV2(partsReqs, undefined, item)
    }

    const data: Array<PieChartSeries> = []
    if (target === "region") {
        statusList.map((status, index) => {
            const x = { value: partsByRegion[item.toUpperCase()][status], label: status, color: colorPallete[index] }
            data.push(x)
        })
    } else if (target === "status") {
        regionList.map((region, index) => {
            const x = { value: partsByStatus[item][region.toUpperCase()], label: region, color: colorPallete[index] }
            data.push(x)
        })
    }

    const isMobile = useMediaQuery("(max-width: 780px)")

    const desktopSelectorWrapper = {
        display: "flex",
        justifyContent: "space-between",
    }

    const mobileSelectorWrapper = {
        display: "flex",
        flexDirection: "column-reverse",
        alignItems: "center",
        gap: "32px",
    }

    const desktopChartWrapper = {
        display: "flex",
        gap: "64px",
        alignItems: "center",
        marginTop: "32px",
    }

    const mobileChartWrapper = {
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        marginTop: "32px",
    }

    return (
        <Box sx={{ background: "#242424", borderRadius: "16px", padding: "24px", mx: "auto", my: 4 }}>
            <Box sx={isMobile ? mobileSelectorWrapper : desktopSelectorWrapper}>
                <TargetDropdownMenu target={target} menu={menu} item={item} setItem={setItem} />
                <TargetToggleButton target={target} setTarget={setTarget} setMenu={setMenu} regionList={regionList} setItem={setItem} />
            </Box>
            <Box sx={isMobile ? mobileChartWrapper : desktopChartWrapper}>
                <Box sx={{ height: "320px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <PartsPieChart target={target} item={item} data={data} isMobile={isMobile} />
                </Box>
                <PartsLegend target={target} data={data} item={item} isMobile={isMobile} />
            </Box>
            <Box sx={{ display: "flex", aligItems: "center", justifyContent: "center", marginTop: "32px", fontSize: "20px" }}>
                <Link
                    underline={isMobile ? "always" : "hover"}
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                        if (target === "region") {
                            return navigateToSupplyChain(navigate, "Unit Down", undefined, item)
                        } else {
                            return navigateToSupplyChain(navigate, "Unit Down")
                        }
                    }}
                >
                    Units down: {unitsDown}
                </Link>
            </Box>
        </Box>
    )
}
