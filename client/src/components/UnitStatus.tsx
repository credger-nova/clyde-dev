import Table from "@mui/material/Table"
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Unit } from "../types/types";

interface Props {
    units: Array<Unit>
}

export default function UnitStatus(props: Props) {
    return (
        <TableContainer component={Paper} sx={{maxHeight: 500}}>
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
                    {props.units.map((row: Unit) => (
                        <TableRow
                            key={row.unitNumber}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">{row.unitNumber}</TableCell>
                            <TableCell>{row.engine}</TableCell>
                            <TableCell>{row.oemHP}</TableCell>
                            <TableCell>{row.compressorFrame}</TableCell>
                            <TableCell>{row.status}</TableCell>
                            <TableCell>{row.customer}</TableCell>
                            <TableCell>{row.location}</TableCell>
                            <TableCell>{row.operationalRegion}</TableCell>
                            <TableCell>{row.telemetry}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}