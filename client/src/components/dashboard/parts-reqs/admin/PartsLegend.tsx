import { Box, Link, List, ListItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PieChartSeries } from "./AdminPartsReq";
import { navigateToSupplyChain } from "../dashboardFunctions";

interface Props{
    data: Array<PieChartSeries>;
    target: string;
    item: string;
}

export default function PartsLegend(props: Props){
    const {data, target, item} = props
    const navigate = useNavigate()

    const listItems = data.map((listItem) => {
        return(
            <ListItem key={listItem.label} sx={{display: 'grid', gridTemplateColumns: "32px 160px 32px"}}>
                <Box sx={{height: 16, width: 16, bgcolor: `${listItem.color}` }}></Box>
                <Link
                    underline="hover"
                    onClick={() => {
                        if(target === 'region'){
                            return navigateToSupplyChain(navigate, listItem.label, undefined, item)
                        } else {
                            return navigateToSupplyChain(navigate, item, undefined, listItem.label)
                        }
                    }}
                >
                    {listItem.label}  
                </Link>
                <Box>{listItem.value}</Box>
            </ListItem>
        )
    })

    return(
        <List>
            {listItems}
        </List>
    )
}