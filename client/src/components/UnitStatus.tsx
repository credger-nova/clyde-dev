import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { UnitSatus } from "../types/types";

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
    parameters: Array<UnitSatus> | null
}

export default function UnitStatus(props: Props) {
    return (
        <TableContainer component={Paper}>
            <Table size="small" aria-label="Unit Status" stickyHeader>
                <TableHead>
                    <StyledTableRow>
                        <StyledTableCell>Unit Number</StyledTableCell>
                        <StyledTableCell>Status</StyledTableCell>
                        <StyledTableCell>Status Message</StyledTableCell>
                        <StyledTableCell>Last Updated</StyledTableCell>
                    </StyledTableRow>
                </TableHead>
                <TableBody>
                    {props.parameters?.map((param: UnitSatus) => (
                        <StyledTableRow
                            key={param.unitNumber}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <StyledTableCell>{param.unitNumber}</StyledTableCell>
                            <StyledTableCell>{param.status}</StyledTableCell>
                            <StyledTableCell>{param.statusMessage}</StyledTableCell>
                            <StyledTableCell>{new Date(param.timestamp).toLocaleString()}</StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}