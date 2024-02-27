import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell, { tableCellClasses } from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { PartsReq } from '../../types/partsReq'
import Skeleton from '@mui/material/Skeleton'

import { calcCost } from '../../utils/helperFunctions'
import { UNIT_PLANNING } from '../../utils/unitPlanning'

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
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
    '&:hover': {
        background: '#334787ad'
    }
}))

const tableBodyStyles = {
    "&:hover": {
        cursor: "pointer"
    }
}

interface Props {
    partsReqs: Array<PartsReq> | undefined,
    fetching: boolean,
    setActivePartsReq: React.Dispatch<React.SetStateAction<PartsReq | null>>
}

export default function PartsReqTable(props: Props) {
    const { partsReqs, fetching, setActivePartsReq } = props

    return !fetching ? (
        <TableContainer component={Paper}>
            <Table size="small" aria-label="Unit Status" stickyHeader>
                <TableHead>
                    <StyledTableRow>
                        <StyledTableCell>ID</StyledTableCell>
                        <StyledTableCell>Requester</StyledTableCell>
                        <StyledTableCell>Date</StyledTableCell>
                        <StyledTableCell>Class</StyledTableCell>
                        <StyledTableCell>Related Asset</StyledTableCell>
                        <StyledTableCell>Urgency</StyledTableCell>
                        <StyledTableCell>Order Type</StyledTableCell>
                        <StyledTableCell>Region</StyledTableCell>
                        <StyledTableCell>Est. Cost</StyledTableCell>
                        <StyledTableCell>Status</StyledTableCell>
                    </StyledTableRow>
                </TableHead>
                <TableBody
                    sx={tableBodyStyles}
                >
                    {partsReqs?.map((partsReq) => (
                        <StyledTableRow
                            key={partsReq.id}
                            onClick={() => setActivePartsReq(partsReq)}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <StyledTableCell>{partsReq.id}</StyledTableCell>
                            <StyledTableCell>{partsReq.requester}</StyledTableCell>
                            <StyledTableCell>{new Date(partsReq.date).toLocaleDateString()}</StyledTableCell>
                            {partsReq.afe ?
                                <StyledTableCell>{`AFE: ${partsReq.afe}`}</StyledTableCell> :
                                partsReq.so ?
                                    <StyledTableCell>{`SO: ${partsReq.so}`}</StyledTableCell> :
                                    <StyledTableCell />
                            }
                            {partsReq.unit ?
                                <StyledTableCell>{`Unit: ${partsReq.unit.unitNumber}`}</StyledTableCell> :
                                <StyledTableCell>{`Truck: ${partsReq.truck}`}</StyledTableCell>
                            }
                            <StyledTableCell>{partsReq.urgency}</StyledTableCell>
                            <StyledTableCell>{partsReq.orderType}</StyledTableCell>
                            <StyledTableCell>{partsReq.region}</StyledTableCell>
                            <StyledTableCell>{calcCost(partsReq.parts)}</StyledTableCell>
                            <StyledTableCell>
                                {(partsReq.unit && UNIT_PLANNING.includes(partsReq.unit.unitNumber)) &&
                                    (partsReq.status === "Pending Approval" || partsReq.status === "Rejected - Adjustments Required") ?
                                    <>
                                        {partsReq.status + ' - '}
                                        <Typography variant="caption" sx={{ color: "red", fontWeight: 700 }}>
                                            Travis Yount Must Approve Non-PM Parts
                                        </Typography>
                                    </>
                                    : partsReq.status
                                }
                            </StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    ) :
        <TableContainer component={Paper}>
            <Table size="small" aria-label="Unit Status" stickyHeader>
                <TableHead>
                    <StyledTableRow>
                        <StyledTableCell>ID</StyledTableCell>
                        <StyledTableCell>Requester</StyledTableCell>
                        <StyledTableCell>Date</StyledTableCell>
                        <StyledTableCell>Class</StyledTableCell>
                        <StyledTableCell>Related Asset</StyledTableCell>
                        <StyledTableCell>Urgency</StyledTableCell>
                        <StyledTableCell>Order Type</StyledTableCell>
                        <StyledTableCell>Region</StyledTableCell>
                        <StyledTableCell>Est. Cost</StyledTableCell>
                        <StyledTableCell>Status</StyledTableCell>
                    </StyledTableRow>
                </TableHead>
                <TableBody
                    sx={tableBodyStyles}
                >
                    {Array(15).fill(0).map((_, index) => {
                        return (
                            <StyledTableRow
                                key={index}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <StyledTableCell>
                                    <Skeleton
                                        animation="wave"
                                    />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton
                                        animation="wave"
                                    />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton
                                        animation="wave"
                                    />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton
                                        animation="wave"
                                    />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton
                                        animation="wave"
                                    />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton
                                        animation="wave"
                                    />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton
                                        animation="wave"
                                    />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton
                                        animation="wave"
                                    />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton
                                        animation="wave"
                                    />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton
                                        animation="wave"
                                    />
                                </StyledTableCell>
                            </StyledTableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
} 