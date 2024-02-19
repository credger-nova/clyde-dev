import { PartsReq } from "../../types/partsReq"
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Skeleton from '@mui/material/Skeleton'

import { calcCost } from "../../utils/helperFunctions"

interface Props {
    partsReq: PartsReq,
    setActivePartsReq: React.Dispatch<React.SetStateAction<PartsReq | null>>
}

const StyledCard = styled(Card)(() => ({
    cursor: "pointer",
    border: "3px solid transparent",
    transition: "transform 0.1s ease-in-out",
    "&:hover": {
        transform: "scale3d(1.05, 1.05, 1)"
    }
}))

// Skeleton version of a card
export function SkeletonCard() {
    return (
        <Card
            sx={{
                height: "256px", width: "281px", backgroundImage: "none", margin: "0px 15px 15px 0px", padding: "5px", borderRadius: "0.5rem"
            }}
        >
            <CardHeader
                sx={{ padding: "5px" }}
                title={
                    <Skeleton
                        animation={"wave"}
                        sx={{ width: "80%" }}
                    />
                }
                subheader={
                    <Skeleton
                        animation={"wave"}
                        sx={{ width: "60%" }}
                    />
                }
            >
            </CardHeader>
            <Divider />
            <CardContent
                sx={{ padding: "5px" }}
            >
                <Skeleton
                    animation={"wave"}
                    sx={{ width: "80%", marginBottom: "5px" }}
                />
                <Skeleton
                    animation={"wave"}
                    sx={{ width: "80%", marginBottom: "5px" }}
                />
                <Skeleton
                    animation={"wave"}
                    sx={{ width: "80%", marginBottom: "5px" }}
                />
                <Skeleton
                    animation={"wave"}
                    sx={{ width: "80%", marginBottom: "5px" }}
                />
                <Skeleton
                    animation={"wave"}
                    sx={{ width: "80%", marginBottom: "5px" }}
                />
            </CardContent>
            <Divider />
            <CardContent
                sx={{ padding: "5px" }}
            >
                <Skeleton
                    animation={"wave"}
                    sx={{ width: "40%", marginBottom: "5px" }}
                />
                <Skeleton
                    animation={"wave"}
                    sx={{ width: "40%", marginBottom: "5px" }}
                />
            </CardContent>
        </Card>
    )
}

export default function PartsReqCard(props: Props) {
    const { partsReq, setActivePartsReq } = props

    return (
        <StyledCard
            onClick={() => { setActivePartsReq(partsReq) }}
            sx={{
                maxHeight: "250px", width: "275px", backgroundImage: "none", margin: "0px 15px 15px 0px", padding: "5px", borderRadius: "0.5rem"
            }}
        >
            <CardHeader
                title={`Parts Requisition #${partsReq.id}`}
                subheader={`${partsReq.requester} - ${new Date(partsReq.date).toLocaleDateString()}`}
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
                        {partsReq.afe ?
                            <Typography variant="body2" sx={{ width: "50%" }}>
                                {`AFE ${partsReq.afe}`}
                            </Typography> : null
                        }
                        {partsReq.so ?
                            <Typography variant="body2" sx={{ width: "50%" }}>
                                {`SO ${partsReq.so}`}
                            </Typography> : null
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center" }}>
                        <Typography variant="subtitle2" sx={{ width: "50%" }}>
                            Related Asset:
                        </Typography>
                        {partsReq.unit ?
                            <Typography variant="body2" sx={{ width: "50%" }}>
                                {`Unit ${partsReq.unit.unitNumber}`}
                            </Typography> :
                            <Typography variant="body2" sx={{ width: "50%" }}>
                                {`Truck ${partsReq.truck}`}
                            </Typography>
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center" }}>
                        <Typography variant="subtitle2" sx={{ width: "50%" }}>
                            Urgency:
                        </Typography>
                        <Typography variant="body2" sx={{ width: "50%" }}>
                            {partsReq.urgency}
                        </Typography>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center" }}>
                        <Typography variant="subtitle2" sx={{ width: "50%" }}>
                            Order Type:
                        </Typography>
                        <Typography variant="body2" sx={{ width: "50%" }}>
                            {partsReq.orderType}
                        </Typography>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center" }}>
                        <Typography variant="subtitle2" sx={{ width: "50%" }}>
                            Region:
                        </Typography>
                        <Typography variant="body2" sx={{ width: "50%" }}>
                            {partsReq.region}
                        </Typography>
                    </div>
                </div>
            </CardContent>
            <Divider />
            <CardContent sx={{ padding: "5px" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <Typography variant="caption">
                        {`Estimated Cost: ${calcCost(partsReq.parts)}`}
                    </Typography>
                    <Typography variant="caption">
                        {partsReq.status}
                    </Typography>
                </div>
            </CardContent>
        </StyledCard>
    )
}