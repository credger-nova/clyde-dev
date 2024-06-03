import { styled } from "@mui/material/styles"

import { useUIState } from "../../../hooks/utils"

import HomeIcon from "@mui/icons-material/Home"
import SensorsIcon from "@mui/icons-material/Sensors"
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined"
import MoveUpIcon from "@mui/icons-material/MoveUp"
import PlaceIcon from "@mui/icons-material/Place"
import { Drawer as MuiDrawer } from "@mui/material"
import PageList from "./PageList"

const drawerWidth = 240

const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
}))

const pages = [
    { name: "Home", url: "", icon: <HomeIcon /> },
    { name: "Unit Status", url: "units", icon: <SensorsIcon />, titles: ["Software Developer"] },
    { name: "Unit Map", url: "map", icon: <PlaceIcon /> },
    { name: "Supply Chain", url: "supply-chain", icon: <MoveUpIcon /> },
    { name: "Forms", url: "forms", icon: <AssignmentOutlinedIcon /> },
]

export default function Drawer() {
    const { state } = useUIState()

    return (
        <MuiDrawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: drawerWidth,
                    boxSizing: "border-box",
                },
            }}
            variant="persistent"
            anchor="left"
            open={state.isDrawerOpen}
        >
            <DrawerHeader />
            <PageList pages={pages} />
        </MuiDrawer>
    )
}
