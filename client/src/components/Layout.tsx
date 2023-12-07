import * as React from "react"
import { styled } from "@mui/material/styles"

import { useUIState } from "../hooks/utils"

import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"
import Toolbar from "@mui/material/Toolbar"
import Link from "@mui/material/Link"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import HomeIcon from '@mui/icons-material/Home'
import SensorsIcon from '@mui/icons-material/Sensors'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import { Link as RouterLink, Outlet } from "react-router-dom"
import ProfileMenu from "./ProfileMenu"

const drawerWidth = 240

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
    open?: boolean
}>(({ theme, open }) => ({
    flexGrow: 1,
    transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    }),
    height: "100%",
}))

const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
}))


type Props = {
    children: React.ReactNode
}

export default function Layout({ children }: Props) {
    const { state, dispatch } = useUIState()

    const onDrawerToggle = () => {
        dispatch({ type: "TOGGLE_DRAWER", payload: !state.isDrawerOpen })
    }

    return (
        <Box sx={{ display: "flex", height: "100%" }}>
            <AppBar
                position="fixed"
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            >
                <Toolbar
                    sx={{
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={onDrawerToggle}
                            edge="start"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Link
                            component={RouterLink}
                            to="/"
                        >
                            <img
                                src="https://res.cloudinary.com/dvdturlak/image/upload/v1701810257/Kepler/nova-simple_yrdti4.svg"
                                alt="Nova Compression"
                                style={{ height: "3.5em", marginLeft: "5px" }}
                            />
                        </Link>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <ProfileMenu />
                    </div>
                </Toolbar>
            </AppBar>
            <Drawer
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
            </Drawer>
            <Main open={state.isDrawerOpen}>
                <DrawerHeader />
                <Outlet />
                {children}
            </Main>
        </Box>
    )
}