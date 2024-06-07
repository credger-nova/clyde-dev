import { Box, Link, List, ListItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function PartsLegend(props){
    const navigate = useNavigate()
    const data = props.data
    const target = props.target
    const item = props.item

    const handleClick = (statusGroup?: string, requesters?: Array<NovaUser>, region?: string, urgency?: string) => {
    
        let statuses: Array<string> = []
        if (statusGroup === "Pending Quote") {
            statuses = ["Pending Quote"]
        } else if (statusGroup === "Pending Approval") {
            statuses = ["Pending Approval", "Quote Provided - Pending Approval", "Sourcing - Request to Cancel"]
        } else if (statusGroup === "Rejected") {
            statuses = ["Rejected - Adjustments Required"]
        } else if (statusGroup === "Approved") {
            statuses = ["Approved", "Approved - On Hold"]
        } else if (statusGroup === "Sourcing") {
            statuses = [
                "Sourcing - In Progress",
                "Sourcing - Information Required",
                "Sourcing - Information Provided",
                "Sourcing - Pending Amex Approval",
                "Sourcing - Amex Approved",
                "Sourcing - Request to Cancel",
            ]
        } else if (statusGroup === "Parts Ordered") {
            statuses = ["Ordered - Awaiting Parts"]
        } else if (statusGroup === "Parts Staged") {
            statuses = ["Completed - Parts Staged/Delivered"]
        } else if (statusGroup === "Closed") {
            statuses = ["Closed - Partially Received", "Closed - Parts in Hand", "Rejected - Closed", "Closed - Order Canceled"]
        } else if (statusGroup === "Unit Down") {
            statuses = UNIT_DOWN_STATUSES
        }
    
        navigate("/supply-chain", {
            state: { statuses: statuses, requesters: requesters, region: region, urgency: urgency },
        })
    }
    
    const listItems = data.map((listItem) => {
        return(
            <ListItem key={listItem.label} sx={{display: 'grid', gridTemplateColumns: "32px 160px 32px"}}>
                <Box sx={{height: 16, width: 16, bgcolor: `${listItem.color}` }}></Box>
                <Link
                    underline="hover"
                    onClick={() => {
                        if(target === 'region'){
                            return handleClick(listItem.label, undefined, item)
                        } else {
                            return handleClick(item, undefined, listItem.label)
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