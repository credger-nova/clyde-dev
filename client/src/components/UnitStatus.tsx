import Table from "@mui/material/Table"
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { UnitSatus } from "../types/types";

interface Props {
    parameters: Array<UnitSatus> | null
}

export default function UnitStatus(props: Props) {
    return (
        <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
            <Table sx={{}} size="small" aria-label="Unit Status" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>Unit Number</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Status Message</TableCell>
                        <TableCell>Last Updated</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.parameters?.map((param: UnitSatus) => (
                        <TableRow
                            key={param.unitNumber}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">{param.unitNumber}</TableCell>
                            <TableCell scope="row">{param.status}</TableCell>
                            <TableCell scope="row">{param.statusMessage}</TableCell>
                            <TableCell scope="row">{new Date(param.timestamp).toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}