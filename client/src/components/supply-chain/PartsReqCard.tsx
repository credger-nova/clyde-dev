import { PartsReq } from "../../types/partsReq"

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import Link from "@mui/material/Link"
import { Link as RouterLink } from "react-router-dom"

import { calcCost, svpApprovalRequired } from "../../utils/helperFunctions"

interface Props {
    partsReq: PartsReq
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
                height: "291px", width: "331px", backgroundImage: "none", margin: "0px 15px 15px 0px", padding: "5px", borderRadius: "0.5rem"
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
    const { partsReq } = props

    return (
        <Link
            component={RouterLink}
            to={`${partsReq.id}`}
            underline="none"
        >
            <StyledCard
                sx={{
                    height: "285px", width: "325px", backgroundImage: "none", margin: "0px 15px 15px 0px", padding: "5px", borderRadius: "0.5rem"
                }}
            >
                <CardHeader
                    title={`Parts Requisition #${partsReq.id}`}
                    subheader={`${partsReq.requester.firstName} ${partsReq.requester.lastName} - ${new Date(partsReq.date).toLocaleDateString()}`}
                    sx={{ padding: "5px" }}
                />
                <Divider />
                <CardContent
                    sx={{ padding: "5px" }}
                >
                    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                        <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center" }}>
                            <Typography variant="subtitle2" sx={{ width: "35%" }}>
                                Class:
                            </Typography>
                            {partsReq.afe ?
                                <Typography variant="body2" sx={{ width: "65%" }}>
                                    {`AFE ${partsReq.afe.number}`}
                                </Typography> : null
                            }
                            {partsReq.so ?
                                <Typography variant="body2" sx={{ width: "65%" }}>
                                    {`SO ${partsReq.so}`}
                                </Typography> : null
                            }
                        </div>
                        <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center" }}>
                            <Typography variant="subtitle2" sx={{ width: "35%" }}>
                                Related Asset:
                            </Typography>
                            {partsReq.unit ?
                                <Typography variant="body2" sx={{ width: "65%" }}>
                                    {`Unit ${partsReq.unit.unitNumber}`}
                                </Typography> :
                                partsReq.truck ?
                                    <Typography variant="body2" sx={{ width: "65%" }}>
                                        {`Truck ${partsReq.truck}`}
                                    </Typography> : null
                            }
                        </div>
                        <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center" }}>
                            <Typography variant="subtitle2" sx={{ width: "35%" }}>
                                Location:
                            </Typography>
                            {partsReq.unit ?
                                partsReq.unit.location.length > 21 ?
                                    <Tooltip
                                        title={partsReq.unit.location}
                                        componentsProps={{
                                            tooltip: {
                                                sx: {
                                                    border: "1px solid white",
                                                    bgcolor: "background.paper"
                                                }
                                            }
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ width: "65%" }}>
                                            {`${partsReq.unit.location.slice(0, 21)}...`}
                                        </Typography>
                                    </Tooltip> :
                                    <Typography variant="body2" sx={{ width: "65%" }}>
                                        {partsReq.unit.location}
                                    </Typography> :
                                null
                            }
                        </div>
                        <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center" }}>
                            <Typography variant="subtitle2" sx={{ width: "35%" }}>
                                Customer:
                            </Typography>
                            {partsReq.unit && partsReq.unit.customer ?
                                partsReq.unit.customer.length > 21 ?
                                    <Tooltip
                                        title={partsReq.unit.customer}
                                        componentsProps={{
                                            tooltip: {
                                                sx: {
                                                    border: "1px solid white",
                                                    bgcolor: "background.paper"
                                                }
                                            }
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ width: "65%" }}>
                                            {`${partsReq.unit.customer.slice(0, 21)}...`}
                                        </Typography>
                                    </Tooltip> :
                                    <Typography variant="body2" sx={{ width: "65%" }}>
                                        {partsReq.unit.customer}
                                    </Typography> :
                                null
                            }
                        </div>
                        <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center" }}>
                            <Typography variant="subtitle2" sx={{ width: "35%" }}>
                                Urgency:
                            </Typography>
                            <Typography variant="body2" sx={{ width: "65%" }}>
                                {partsReq.urgency}
                            </Typography>
                        </div>
                        <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center" }}>
                            <Typography variant="subtitle2" sx={{ width: "35%" }}>
                                Order Type:
                            </Typography>
                            <Typography variant="body2" sx={{ width: "65%" }}>
                                {partsReq.orderType}
                            </Typography>
                        </div>
                        <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center" }}>
                            <Typography variant="subtitle2" sx={{ width: "35%" }}>
                                Region:
                            </Typography>
                            <Typography variant="body2" sx={{ width: "65%" }}>
                                {partsReq.region}
                            </Typography>
                        </div>
                    </div>
                </CardContent>
                <Divider />
                <CardContent sx={{ padding: "5px" }}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <Typography variant="caption">
                            {`Estimated Cost: $${calcCost(partsReq.parts).toFixed(2)}`}
                        </Typography>
                        {<div style={{ display: "flex", alignItems: "center" }}>
                            {svpApprovalRequired(partsReq.unit ?? null, partsReq.parts) &&
                                (partsReq.status === "Pending Approval" || partsReq.status === "Rejected - Adjustments Required") ?
                                <Tooltip
                                    title="Travis Yount Must Approve All Non-PM Parts"
                                    componentsProps={{
                                        tooltip: {
                                            sx: {
                                                border: "1px solid white",
                                                bgcolor: "background.paper"
                                            }
                                        }
                                    }}
                                >
                                    <ErrorOutlineIcon sx={{ color: "red", paddingRight: "3px" }} />
                                </Tooltip> : null
                            }
                            <Typography variant="caption">
                                {partsReq.status}
                            </Typography>
                        </div>
                        }
                    </div>
                </CardContent>
            </StyledCard>
        </Link>
    )
}