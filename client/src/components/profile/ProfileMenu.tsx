import * as React from "react"

import { useAuth0 } from "@auth0/auth0-react"

import Avatar from "@mui/material/Avatar"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import Tooltip from "@mui/material/Tooltip"
import Logout from "@mui/icons-material/Logout"

export default function ProfileMenu() {
    const { logout, user } = useAuth0()

    const onLogout = () =>
        logout({
            logoutParams: {
                returnTo: `${window.location.origin}`,
            },
        })

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    return (
        <>
            <Tooltip
                title="Profile"
                placement="left"
                enterDelay={3000}
                componentsProps={{
                    tooltip: {
                        sx: {
                            border: "1px solid white",
                            bgcolor: "background.paper",
                        },
                    },
                }}
            >
                <IconButton onClick={handleClick}>
                    <Avatar src={user?.picture} />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                id="profile-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: "visible",
                            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                            mt: 1.5,
                            "& .MuiAvatar-root": {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            "&:before": {
                                content: '""',
                                display: "block",
                                position: "absolute",
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: "background.paper",
                                transform: "translateY(-50%) rotate(45deg)",
                                zIndex: 0,
                            },
                        },
                    },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                <MenuItem disabled>
                    <Avatar sx={{ height: "20px!important", width: "20px!important" }} src={user?.picture} /> Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={onLogout}>
                    <ListItemIcon>
                        <Logout />
                        Log out
                    </ListItemIcon>
                </MenuItem>
            </Menu>
        </>
    )
}
