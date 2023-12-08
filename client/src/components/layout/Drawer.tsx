import { styled } from "@mui/material/styles"

import { useUIState } from "../../hooks/utils"

import { Drawer as MuiDrawer } from "@mui/material"
import Divider from "@mui/material/Divider"
import Link from "@mui/material/Link"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import HomeIcon from '@mui/icons-material/Home'
import SensorsIcon from '@mui/icons-material/Sensors'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import { Link as RouterLink } from "react-router-dom"

const drawerWidth = 240

const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
}))

export default function Drawer() {
    const { state } = useUIState()

    return (
        <MuiDrawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: drawerWidth,
                    boxSizing: "border-box"
                }
            }}
            variant="persistent"
            anchor="left"
            open={state.isDrawerOpen}
        >
            <DrawerHeader />
            <List
                sx={{ padding: 0 }}
            >
                <Link
                    color="textPrimary"
                    component={RouterLink}
                    sx={{ display: "flex", width: "100%" }}
                    to="/"
                    underline="hover"
                >
                    <ListItemButton>
                        <ListItemIcon>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="Home" />
                    </ListItemButton>
                </Link>
                <Divider />
                <Link
                    color="textPrimary"
                    component={RouterLink}
                    sx={{ display: "flex", width: "100%" }}
                    to="/units"
                    underline="hover"
                >
                    <ListItemButton>
                        <ListItemIcon>
                            <SensorsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Unit Status" />
                    </ListItemButton>
                </Link>
                <Divider />
                <Link
                    color="textPrimary"
                    component={RouterLink}
                    sx={{ display: "flex", width: "100%" }}
                    to="/forms"
                    underline="hover"
                >
                    <ListItemButton>
                        <ListItemIcon>
                            <AssignmentOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Forms" />
                    </ListItemButton>
                </Link>
                <Divider />
            </List>
        </MuiDrawer>
    )
}