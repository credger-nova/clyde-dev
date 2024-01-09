import { OrderRow, Part, PartsReq } from "../../types/partsReq"
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

interface Props {
    partsReq: PartsReq
}

function calcCost(parts: Array<OrderRow>) {
    let sum = 0

    for (const part of parts) {
        sum += Number(part.cost)
    }

    return `$${sum.toFixed(2)}`
}

export default function PartsReqCard(props: Props) {

    return (
        <Card
            sx={{ maxHeight: "250px", width: "275px", backgroundImage: "none", margin: "0px 15px 15px 0px", padding: "5px", borderRadius: "0.5rem" }}
        >
            <CardHeader
                title={`Parts Requisition #${props.partsReq.id}`}
                subheader={`${props.partsReq.requester} - ${new Date(props.partsReq.date).toLocaleDateString()}`}
                sx={{ padding: "5px" }}
            />
            <Divider />
            <CardContent
                sx={{ padding: "5px" }}
            >
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center" }}>
                        <Typography variant="subtitle2" sx={{ width: "50%" }}>
                            Class:
                        </Typography>
                        {props.partsReq.class.afe ?
                            <Typography variant="body2" sx={{ width: "50%" }}>
                                {`AFE ${props.partsReq.class.afe}`}
                            </Typography> :
                            <Typography variant="body2" sx={{ width: "50%" }}>
                                {`SO ${props.partsReq.class.so}`}
                            </Typography>
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center" }}>
                        <Typography variant="subtitle2" sx={{ width: "50%" }}>
                            Related Asset:
                        </Typography>
                        {props.partsReq.relAsset.unit ?
                            <Typography variant="body2" sx={{ width: "50%" }}>
                                {`Unit ${props.partsReq.relAsset.unit}`}
                            </Typography> :
                            <Typography variant="body2" sx={{ width: "50%" }}>
                                {`Truck ${props.partsReq.relAsset.truck}`}
                            </Typography>
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center" }}>
                        <Typography variant="subtitle2" sx={{ width: "50%" }}>
                            Urgency:
                        </Typography>
                        <Typography variant="body2" sx={{ width: "50%" }}>
                            {props.partsReq.urgency}
                        </Typography>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center" }}>
                        <Typography variant="subtitle2" sx={{ width: "50%" }}>
                            Order Type:
                        </Typography>
                        <Typography variant="body2" sx={{ width: "50%" }}>
                            {props.partsReq.orderType}
                        </Typography>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center" }}>
                        <Typography variant="subtitle2" sx={{ width: "50%" }}>
                            Region:
                        </Typography>
                        <Typography variant="body2" sx={{ width: "50%" }}>
                            {props.partsReq.region}
                        </Typography>
                    </div>
                </div>
            </CardContent>
            <Divider />
            <CardContent>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                    <Typography variant="caption">
                        {props.partsReq.status}
                    </Typography>
                    <Typography variant="caption">
                        {calcCost(props.partsReq.parts)}
                    </Typography>
                </div>
            </CardContent>
        </Card>
    )
}