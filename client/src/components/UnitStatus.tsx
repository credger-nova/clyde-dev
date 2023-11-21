import Table from "@mui/material/Table"
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Parameter } from "../types/types";

interface Props {
    parameters: Record<string, Array<Parameter>> | null
}

export default function UnitStatus(props: Props) {
    return (
        <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
            <Table sx={{}} size="small" aria-label="Unit Status" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>Unit Number</TableCell>
                        <TableCell>Engine</TableCell>
                        <TableCell>OEM HP</TableCell>
                        <TableCell>Compressor Name</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Customer Name</TableCell>
                        <TableCell>Lease Name</TableCell>
                        <TableCell>Operational Region</TableCell>
                        <TableCell>Telemetry</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(props.parameters ? props.parameters : []).map(([key, value]) => (
                        <TableRow
                            key={key}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">{key}</TableCell>
                            <TableCell>{}</TableCell>
                            <TableCell>{}</TableCell>
                            <TableCell>{}</TableCell>
                            <TableCell>{}</TableCell>
                            <TableCell>{}</TableCell>
                            <TableCell>{}</TableCell>
                            <TableCell>{}</TableCell>
                            <TableCell>{}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}