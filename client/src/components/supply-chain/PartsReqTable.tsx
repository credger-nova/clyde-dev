import { PartsReq } from "../../types/partsReq"

import { calcCost, opsVpApprovalRequired } from "../../utils/helperFunctions"

import { useNavigate } from "react-router-dom"

import { styled } from "@mui/material/styles"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell, { tableCellClasses } from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
import Tooltip from "@mui/material/Tooltip"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"

const PERMIAN_REGIONS = ["North Permian", "South Permian", "Pecos", "Carlsbad"]

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
        border: 0,
    },
    "&:hover": {
        background: "#334787ad",
    },
}))

const tableBodyStyles = {
    "&:hover": {
        cursor: "pointer",
    },
}

interface Props {
    partsReqs: Array<PartsReq> | undefined
    fetching: boolean
}

export default function PartsReqTable(props: Props) {
    const { partsReqs, fetching } = props

    const navigate = useNavigate()

    return !fetching ? (
        <TableContainer component={Paper} sx={{ height: "100%" }}>
            <Table size="small" aria-label="Parts Reqs" stickyHeader>
                <TableHead>
                    <StyledTableRow>
                        <StyledTableCell>ID</StyledTableCell>
                        <StyledTableCell>Requester</StyledTableCell>
                        <StyledTableCell>Date</StyledTableCell>
                        <StyledTableCell>Class</StyledTableCell>
                        <StyledTableCell>Related Asset</StyledTableCell>
                        <StyledTableCell>Location</StyledTableCell>
                        <StyledTableCell>Customer</StyledTableCell>
                        <StyledTableCell>Urgency</StyledTableCell>
                        <StyledTableCell>Order Type</StyledTableCell>
                        <StyledTableCell>Region</StyledTableCell>
                        <StyledTableCell>Est. Cost</StyledTableCell>
                        <StyledTableCell>Status</StyledTableCell>
                    </StyledTableRow>
                </TableHead>
                <TableBody sx={tableBodyStyles}>
                    {partsReqs?.map((partsReq) => (
                        <StyledTableRow
                            key={partsReq.id}
                            onClick={() => navigate(`${partsReq.id}`)}
                            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                        >
                            <StyledTableCell>{partsReq.id}</StyledTableCell>
                            <StyledTableCell>{`${partsReq.requester.firstName} ${partsReq.requester.lastName}`}</StyledTableCell>
                            <StyledTableCell>{new Date(partsReq.date).toLocaleDateString()}</StyledTableCell>
                            {partsReq.afe ? (
                                <StyledTableCell>{`AFE: ${partsReq.afe.number}`}</StyledTableCell>
                            ) : partsReq.salesOrder ? (
                                <StyledTableCell>{`SO: ${partsReq.salesOrder.number}`}</StyledTableCell>
                            ) : (
                                <StyledTableCell />
                            )}
                            {partsReq.unit ? (
                                <StyledTableCell>{`Unit: ${partsReq.unit.unitNumber}`}</StyledTableCell>
                            ) : partsReq.truck ? (
                                <StyledTableCell>{`Truck: ${partsReq.truck.name}`}</StyledTableCell>
                            ) : (
                                <StyledTableCell />
                            )}
                            {partsReq.unit && partsReq.unit.location ? (
                                partsReq.unit.location.length > 25 ? (
                                    <Tooltip
                                        title={partsReq.unit.location}
                                        componentsProps={{
                                            tooltip: {
                                                sx: {
                                                    border: "1px solid white",
                                                    bgcolor: "background.paper",
                                                },
                                            },
                                        }}
                                    >
                                        <StyledTableCell>{`${partsReq.unit.location.slice(0, 25)}...`}</StyledTableCell>
                                    </Tooltip>
                                ) : (
                                    <StyledTableCell>{partsReq.unit.location}</StyledTableCell>
                                )
                            ) : (
                                <StyledTableCell />
                            )}
                            {partsReq.unit && partsReq.unit.customer ? (
                                partsReq.unit.customer.length > 20 ? (
                                    <Tooltip
                                        title={partsReq.unit.customer}
                                        componentsProps={{
                                            tooltip: {
                                                sx: {
                                                    border: "1px solid white",
                                                    bgcolor: "background.paper",
                                                },
                                            },
                                        }}
                                    >
                                        <StyledTableCell>{`${partsReq.unit.customer.slice(0, 20)}...`}</StyledTableCell>
                                    </Tooltip>
                                ) : (
                                    <StyledTableCell>{partsReq.unit.customer}</StyledTableCell>
                                )
                            ) : (
                                <StyledTableCell />
                            )}
                            <StyledTableCell>{partsReq.urgency}</StyledTableCell>
                            <StyledTableCell>{partsReq.orderType}</StyledTableCell>
                            <StyledTableCell>{partsReq.region}</StyledTableCell>
                            <StyledTableCell>${calcCost(partsReq.parts).toFixed(2)}</StyledTableCell>
                            <StyledTableCell>
                                {
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        {opsVpApprovalRequired(partsReq.unit ?? null, partsReq.parts) &&
                                        (partsReq.status === "Pending Approval" || partsReq.status === "Rejected - Adjustments Required") ? (
                                            <Tooltip
                                                title={
                                                    PERMIAN_REGIONS.includes(partsReq.region)
                                                        ? "Sean Stewart must approve all non-PM parts"
                                                        : "Travis Yount must approve all non-PM parts"
                                                }
                                                componentsProps={{
                                                    tooltip: {
                                                        sx: {
                                                            border: "1px solid white",
                                                            bgcolor: "background.paper",
                                                        },
                                                    },
                                                }}
                                            >
                                                <ErrorOutlineIcon sx={{ color: "red", paddingRight: "3px" }} />
                                            </Tooltip>
                                        ) : null}
                                        <Typography variant="caption">{partsReq.status}</Typography>
                                    </div>
                                }
                            </StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    ) : (
        <TableContainer component={Paper}>
            <Table size="small" aria-label="Unit Status" stickyHeader>
                <TableHead>
                    <StyledTableRow>
                        <StyledTableCell>ID</StyledTableCell>
                        <StyledTableCell>Requester</StyledTableCell>
                        <StyledTableCell>Date</StyledTableCell>
                        <StyledTableCell>Class</StyledTableCell>
                        <StyledTableCell>Related Asset</StyledTableCell>
                        <StyledTableCell>Location</StyledTableCell>
                        <StyledTableCell>Customer</StyledTableCell>
                        <StyledTableCell>Urgency</StyledTableCell>
                        <StyledTableCell>Order Type</StyledTableCell>
                        <StyledTableCell>Region</StyledTableCell>
                        <StyledTableCell>Est. Cost</StyledTableCell>
                        <StyledTableCell>Status</StyledTableCell>
                    </StyledTableRow>
                </TableHead>
                <TableBody sx={tableBodyStyles}>
                    {Array(20)
                        .fill(0)
                        .map((_, index) => {
                            return (
                                <StyledTableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                    <StyledTableCell>
                                        <Skeleton animation="wave" />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Skeleton animation="wave" />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Skeleton animation="wave" />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Skeleton animation="wave" />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Skeleton animation="wave" />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Skeleton animation="wave" />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Skeleton animation="wave" />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Skeleton animation="wave" />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Skeleton animation="wave" />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Skeleton animation="wave" />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Skeleton animation="wave" />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Skeleton animation="wave" />
                                    </StyledTableCell>
                                </StyledTableRow>
                            )
                        })}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
