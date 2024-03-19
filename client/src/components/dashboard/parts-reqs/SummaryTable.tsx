import * as React from "react"

import { NovaUser } from "../../../types/novaUser"
import { PartsReqQuery } from "../../../types/partsReq"

import { useManagersEmployees } from "../../../hooks/user"
import { usePartsReqs } from "../../../hooks/partsReq"

import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell, { tableCellClasses } from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

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

interface Props {
    novaUser: NovaUser,
    group: string
}

export default function SummaryTable(props: Props) {
    const { novaUser, group } = props

    const [partsReqQuery, setPartsReqQuery] = React.useState<PartsReqQuery>({ user: novaUser })

    const { data: managersEmployees, isFetching: managersEmployeesFetching } = useManagersEmployees(novaUser.id)
    const { data: partsReqs, isFetching: partsReqsFetching } = usePartsReqs(partsReqQuery)

    React.useEffect(() => {
        if (!managersEmployeesFetching) {
            setPartsReqQuery(prevState => ({
                ...prevState,
                requester: managersEmployees?.map((employee) => `${employee.firstName} ${employee.lastName}`)
            }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [managersEmployeesFetching])

    if (group === "Ops Manager") {
        return (
            !managersEmployeesFetching ? managersEmployees?.map((employee) => {
                return (
                    <Accordion
                        key={employee.id}
                        disableGutters
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                                flexDirection: "row-reverse",
                                "& .MuiAccordionSummary-content": {
                                    margin: 0
                                },
                                "&.MuiAccordionSummary-root": {
                                    minHeight: 0,
                                    margin: "5px 0px"
                                }
                            }}
                        >
                            <div>
                                {`${employee.firstName} ${employee.lastName}`}
                            </div>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Divider />
                            <TableContainer component={Paper}>
                                <Table size="small" aria-label={`${employee.firstName} ${employee.lastName} Parts Reqs`}>
                                    <TableHead>

                                    </TableHead>
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>
                )
            }) : null // TODO: add skeleton
        )
    } else {
        return null
    }
}