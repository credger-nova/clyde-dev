import * as React from "react"
import Box from '@mui/material/Box'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import EditNoteIcon from '@mui/icons-material/EditNote';
import Link from "@mui/material/Link"
import { Link as RouterLink } from "react-router-dom"
import { useTheme } from "@mui/material";

interface Props {
    category: string,
    forms: Array<{ name: string, category: string, url: string }>
}

export default function FormList(props: Props) {
    const theme = useTheme()

    const [filteredForms, setFilteredForms] = React.useState<Array<{ name: string, category: string, url: string }>>([])

    React.useEffect(() => {
        const forms = props.forms.filter((form) => {
            return (form.category === props.category)
        })

        setFilteredForms(forms)
    }, [props.category, props.forms])

    return (
        <Box sx={{ width: "100%", height: "fit-content", bgcolor: "background.paper", margin: "15px 15px 15px 0px", borderRadius: "0.5rem" }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell width={"15%"}>Name</TableCell>
                        <TableCell width={"15%"}>Category</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.category === "All" ?
                        props.forms.map((form) => (
                            <TableRow
                                key={form.name}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>{form.name}</TableCell>
                                <TableCell>{form.category}</TableCell>
                                <TableCell>
                                    <Link
                                        component={RouterLink}
                                        to={`new/${form.url}`}
                                    >
                                        <Button
                                            variant="contained"
                                            startIcon={<EditNoteIcon />}
                                            sx={{
                                                backgroundColor: theme.palette.primary.dark,
                                                "&.MuiButton-root:hover": {
                                                    backgroundColor: theme.palette.primary.dark
                                                }
                                            }}
                                        >
                                            Fill Out
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        )) :
                        filteredForms.map((form) => (
                            <TableRow
                                key={form.name}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>{form.name}</TableCell>
                                <TableCell>{form.category}</TableCell>
                                <TableCell>
                                    <Link
                                        component={RouterLink}
                                        to={`new/${form.url}`}
                                    >
                                        <Button
                                            variant="contained"
                                            startIcon={<EditNoteIcon />}
                                            sx={{
                                                backgroundColor: theme.palette.primary.dark,
                                                "&.MuiButton-root:hover": {
                                                    backgroundColor: theme.palette.primary.dark
                                                }
                                            }}
                                        >
                                            Fill Out
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </Box>
    )
}