import * as React from "react"
import { styled } from "@mui/material/styles"

import { useUIState } from "../../hooks/utils"

import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"
import Toolbar from "@mui/material/Toolbar"
import Link from "@mui/material/Link"
import { Link as RouterLink, Outlet } from "react-router-dom"
import ProfileMenu from "../profile/ProfileMenu"
import Drawer from "./drawer/Drawer"

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

    const ENV = import.meta.env.VITE_ENV

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
                        <h3>
                            {ENV === "test" ? "TEST" : null}
                        </h3>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <ProfileMenu />
                    </div>
                </Toolbar>
            </AppBar>
            <Drawer />
            <Main open={state.isDrawerOpen}>
                <DrawerHeader />
                <Outlet />
                {children}
            </Main>
        </Box>
    )
}