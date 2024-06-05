import { Box, Link, List, ListItem } from "@mui/material";

export default function PartsLegend(props){
    const data = props.data
    const listItems = data.map((item) => {
        return(
            <ListItem key={item.label} sx={{display: 'grid', gridTemplateColumns: "32px 160px 32px"}}>
                <Box sx={{height: 16, width: 16, bgcolor: `${item.color}` }}></Box>
                <Link href="https://example.com"  underline="hover">{item.label}</Link>
                <Box>{item.value}</Box>
            </ListItem>
        )
    })

    return(
        <List>
            {listItems}
        </List>
    )
}