import { styled } from "@mui/material/styles"
import ListItemButton from "@mui/material/ListItem"

export const StyledListItemButton = styled(ListItemButton)({
    color: "darkgray",
    ".MuiListItemIcon-root": {
        color: "darkgray"
    },
    "&.Mui-selected": {
        color: "white",
        textDecoration: "underline",
        backgroundColor: "transparent",
        ".MuiListItemIcon-root": {
            color: "white"
        }
    },
    "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        cursor: "pointer"
    }
})