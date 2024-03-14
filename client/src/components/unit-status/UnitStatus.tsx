import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircleIcon from '@mui/icons-material/Circle';
import { UnitStatus as IUnitStatus } from "../../types/unit";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

interface Props {
    parameters: Array<IUnitStatus> | undefined
}

export default function UnitStatus(props: Props) {
    return (
        <TableContainer component={Paper} sx={{ margin: "20px" }}>
            <Table size="small" aria-label="Unit Status" stickyHeader>
                <TableHead>
                    <StyledTableRow>
                        <StyledTableCell>Unit Number</StyledTableCell>
                        <StyledTableCell>Status</StyledTableCell>
                        <StyledTableCell>Status Message</StyledTableCell>
                        <StyledTableCell>Location</StyledTableCell>
                        <StyledTableCell>Customer</StyledTableCell>
                        <StyledTableCell>Engine Family</StyledTableCell>
                        <StyledTableCell>Telemetry</StyledTableCell>
                        <StyledTableCell>Last Updated</StyledTableCell>
                    </StyledTableRow>
                </TableHead>
                <TableBody>
                    {props.parameters?.map((param: IUnitStatus) => (
                        <StyledTableRow
                            key={param.unitNumber}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <StyledTableCell>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <CircleIcon sx={{
                                        color: param.status === "Stopped" ? "red" : param.status === "Cold" ? "deepskyblue" : "green",
                                        fontSize: "1.25rem",
                                        marginRight: "5px"
                                    }} />
                                    {param.unitNumber}
                                </div>
                            </StyledTableCell>
                            <StyledTableCell>{param.status}</StyledTableCell>
                            <StyledTableCell>{param.statusMessage}</StyledTableCell>
                            <StyledTableCell>{param.location}</StyledTableCell>
                            <StyledTableCell>{param.customer}</StyledTableCell>
                            <StyledTableCell>{param.engineFamily}</StyledTableCell>
                            <StyledTableCell>{param.telemetry}</StyledTableCell>
                            <StyledTableCell>{new Date(param.timestamp).toLocaleString()}</StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}