import React from "react"

import { styled } from "@mui/material/styles"
import Divider from "@mui/material/Divider"
import Link from "@mui/material/Link"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import { Link as RouterLink } from "react-router-dom"

interface Page {
    name: string,
    url: string,
    icon: JSX.Element
}

interface Props {
    pages: Array<Page>
}

const StyledListItemButton = styled(ListItemButton)({
    color: "darkgray",
    ".MuiListItemIcon-root": {
        color: "darkgray"
    },
    "&.Mui-selected": {
        color: "white",
        borderLeft: "4px solid white",
        backgroundColor: "transparent",
        ".MuiListItemIcon-root": {
            color: "white"
        }
    },
    "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.08)"
    }
})

export default function PageList(props: Props) {
    const [selectedPage, setSelectedPage] = React.useState<string>(location.pathname.split("/")[1])
    const handleClick = (page: string) => {
        setSelectedPage(page)
    }

    return (
        <List
            sx={{ padding: 0 }}
        >
            {props.pages.map((page) => (
                <React.Fragment
                    key={page.url}
                >
                    <Link
                        component={RouterLink}
                        sx={{ display: "flex", width: "100%" }}
                        to={`/${page.url}`}
                        underline="none"
                    >
                        <StyledListItemButton
                            selected={selectedPage === page.url}
                            onClick={() => handleClick(page.url)}
                        >
                            <ListItemIcon
                                sx={{ minWidth: "35px" }}
                            >
                                {page.icon}
                            </ListItemIcon>
                            <ListItemText primary={page.name} />
                        </StyledListItemButton>
                    </Link>
                    <Divider />
                </React.Fragment>
            ))
            }
        </List>
    )
}