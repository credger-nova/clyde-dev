import * as React from "react"
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemText from '@mui/material/ListItemText'
import { StyledListItemButton } from "../common/StyledListItemButton"

interface Props {
    category: string,
    setCategory: React.Dispatch<React.SetStateAction<string>>,
    forms: Array<{ name: string, category: string, url: string }>
}

export default function FormCategories(props: Props) {
    const categories = [...new Set(props.forms.map(form => form.category))]

    return (
        <Box sx={{ width: "100%", maxWidth: 250, height: "fit-content", bgcolor: "background.paper", margin: "15px", borderRadius: "0.5rem" }}>
            <List sx={{ padding: "10px" }}>
                <React.Fragment key="All">
                    <StyledListItemButton
                        selected={props.category === "All"}
                        onClick={() => props.setCategory("All")}
                    >
                        <ListItemText>
                            All
                        </ListItemText>
                    </StyledListItemButton>
                </React.Fragment>
                {categories.map((cat) => (
                    <React.Fragment key={cat}>
                        <StyledListItemButton
                            selected={cat === props.category}
                            onClick={() => props.setCategory(cat)}
                        >
                            <ListItemText>
                                {cat}
                            </ListItemText>
                        </StyledListItemButton>
                    </React.Fragment>
                ))}
            </List>
        </Box>
    )
}