import React from "react"

import { useQueryClient } from "@tanstack/react-query"

import Divider from "@mui/material/Divider"
import Link from "@mui/material/Link"
import List from "@mui/material/List"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import { Link as RouterLink } from "react-router-dom"
import { StyledListItemButton } from "../../common/StyledListItemButton"

import { NovaUser } from "../../../types/novaUser"

interface Page {
    name: string,
    url: string,
    icon: JSX.Element,
    titles?: Array<string>
}

interface Props {
    pages: Array<Page>
}

export default function PageList(props: Props) {
    const { pages } = props

    const queryClient = useQueryClient()

    const user = queryClient.getQueriesData({ queryKey: ["user"] })[0][1] as NovaUser // TODO: look into cleaning this up

    const [selectedPage, setSelectedPage] = React.useState<string>(location.pathname.split("/")[1])
    const handleClick = (page: string) => {
        setSelectedPage(page)
    }

    return (
        <List
            sx={{ padding: 0 }}
        >
            {pages.map((page) => {
                const canAccess = page.titles ? page.titles.includes(user.jobTitle) : true

                return (canAccess ?
                    (
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
                    ) :
                    null
                )
            })}
        </List>
    )
}