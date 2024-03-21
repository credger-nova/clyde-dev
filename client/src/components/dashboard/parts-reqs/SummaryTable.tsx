import * as React from "react"

import { NovaUser } from "../../../types/novaUser"
import { PartsReq, PartsReqQuery } from "../../../types/partsReq"

import { useManagersEmployees, useDirectorsEmployees } from "../../../hooks/user"
import { usePartsReqs } from "../../../hooks/partsReq"
import { useNavigate } from "react-router-dom"

import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "#242424",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "left",
    color: "white"
}))

interface Props {
    novaUser: NovaUser,
    group: string
}

const STATUS_GROUPS = ["Pending Approval", "Rejected", "Approved", "Sourcing", "Parts Ordered", "Parts Staged", "Closed"]
const SC_GROUPS = ["Pending Quote", "Approved", "Sourcing", "Parts Ordered", "Parts Staged"]

function calcStatus(partsReqs: Array<PartsReq>, statusGroup: string, requester?: string, requesterGroup?: Array<string>) {
    let filtered: Array<PartsReq> = []

    if (statusGroup === "Pending Quote") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Pending Quote")
    } else if (statusGroup === "Pending Approval") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Pending Approval" || partsReq.status === "Pending Quote" || partsReq.status === "Quote Provided - Pending Approval")
    } else if (statusGroup === "Rejected") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Rejected - Adjustments Required")
    } else if (statusGroup === "Approved") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Approved")
    } else if (statusGroup === "Sourcing") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Sourcing - Information Required" || partsReq.status === "Sourcing - Information Provided" || partsReq.status === "Sourcing - Pending Approval")
    } else if (statusGroup === "Parts Ordered") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Ordered - Awaiting Parts")
    } else if (statusGroup === "Parts Staged") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Completed - Parts Staged/Delivered")
    } else if (statusGroup === "Closed") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Closed - Partially Received" || partsReq.status === "Closed - Parts in Hand")
    }

    if (requester) {
        filtered = filtered.filter((partsReq) => partsReq.requester === requester)
    }
    if (requesterGroup) {
        filtered = filtered.filter((partsReq) => requesterGroup.includes(partsReq.requester))
    }

    return filtered.length
}

export default function SummaryTable(props: Props) {
    const { novaUser, group } = props

    const [partsReqQuery, setPartsReqQuery] = React.useState<PartsReqQuery>({ user: novaUser })

    const { data: managersEmployees, isFetching: managersEmployeesFetching } = useManagersEmployees(novaUser)
    const { data: directorsEmployees, isFetching: directorsEmployeesFetching } = useDirectorsEmployees(novaUser)
    const { data: partsReqs } = usePartsReqs(partsReqQuery)
    const navigate = useNavigate()

    React.useEffect(() => {
        if (!managersEmployeesFetching && group !== "Supply Chain Director") {
            setPartsReqQuery(prevState => ({
                ...prevState,
                requester: managersEmployees?.map((employee) => `${employee.firstName} ${employee.lastName}`)
            }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [managersEmployeesFetching])

    const handleClick = (statusGroup: string, requesters?: Array<NovaUser>) => {
        let statuses: Array<string> = []
        if (statusGroup === "Pending Quote") {
            statuses = ["Pending Quote"]
        } else if (statusGroup === "Pending Approval") {
            statuses = ["Pending Quote", "Pending Approval", "Quote Provided - Pending Approval"]
        } else if (statusGroup === "Rejected") {
            statuses = ["Rejected - Adjustments Required"]
        } else if (statusGroup === "Approved") {
            statuses = ["Approved"]
        } else if (statusGroup === "Sourcing") {
            statuses = ["Sourcing - Information Required", "Sourcing - Information Provided", "Sourcing - Pending Approval"]
        } else if (statusGroup === "Parts Ordered") {
            statuses = ["Ordered - Awaiting Parts"]
        } else if (statusGroup === "Parts Staged") {
            statuses = ["Completed - Parts Staged/Delivered"]
        } else if (statusGroup === "Closed") {
            statuses = ["Closed - Partially Received", "Closed - Parts in Hand"]
        }

        navigate("/supply-chain", { state: { statuses: statuses, requesters: requesters } })
    }

    if (group === "Field Service") {
        return (
            <Paper sx={{ padding: "5px" }}>
                <Grid container>
                    {STATUS_GROUPS.map((statusGroup) => {
                        return (
                            <Grid xs={12} sm={4} spacing={2}>
                                <Item
                                    onClick={() => handleClick(statusGroup)}
                                    sx={{
                                        margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                        transition: "transform 0.1s ease-in-out",
                                        "&:hover": {
                                            transform: "scale3d(1.03, 1.03, 1)"
                                        }
                                    }}>
                                    <Typography>
                                        {`${statusGroup}:`}
                                    </Typography>
                                    <Typography>
                                        {partsReqs ? calcStatus(partsReqs, statusGroup, `${novaUser.firstName} ${novaUser.lastName}`) : 0}
                                    </Typography>
                                </Item>
                            </Grid>
                        )
                    })}
                </Grid>
            </Paper>
        )
    } else if (group === "Ops Manager") {
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
                            <Grid container>
                                {STATUS_GROUPS.map((statusGroup) => {
                                    return (
                                        <Grid xs={12} sm={4} spacing={2}>
                                            <Item
                                                onClick={() => handleClick(statusGroup, [employee])}
                                                sx={{
                                                    margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                                    transition: "transform 0.1s ease-in-out",
                                                    "&:hover": {
                                                        transform: "scale3d(1.05, 1.05, 1)"
                                                    }
                                                }}>
                                                <Typography>
                                                    {`${statusGroup}:`}
                                                </Typography>
                                                <Typography>
                                                    {partsReqs ? calcStatus(partsReqs, statusGroup, `${employee.firstName} ${employee.lastName}`) : 0}
                                                </Typography>
                                            </Item>
                                        </Grid>
                                    )
                                })}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                )
            }) : null // TODO: add skeleton
        )
    } else if (group === "Ops Director") {
        return (
            !directorsEmployeesFetching ? directorsEmployees?.map((employee) => {
                return (
                    employee.title.includes("Manager") && <Accordion
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
                                <b>{`${employee.firstName} ${employee.lastName}`}</b>
                            </div>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Divider />
                            <Grid container>
                                {STATUS_GROUPS.map((statusGroup) => {
                                    return (
                                        <Grid xs={12} sm={4} spacing={2}>
                                            <Item
                                                onClick={() => handleClick(statusGroup, directorsEmployees.filter((subordinate) => subordinate.supervisorId === employee.id).concat(employee))}
                                                sx={{
                                                    margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                                    transition: "transform 0.1s ease-in-out",
                                                    "&:hover": {
                                                        transform: "scale3d(1.05, 1.05, 1)"
                                                    }
                                                }}>
                                                <Typography>
                                                    {`${statusGroup}:`}
                                                </Typography>
                                                <Typography>
                                                    {partsReqs ? calcStatus(partsReqs, statusGroup, undefined, directorsEmployees.filter((subordinate) => subordinate.supervisorId === employee.id)
                                                        .map((user) => `${user.firstName} ${user.lastName}`).concat(`${employee.firstName} ${employee.lastName}`)) : 0}
                                                </Typography>
                                            </Item>
                                        </Grid>
                                    )
                                })}
                            </Grid>
                        </AccordionDetails>
                        {directorsEmployees.filter((subordinate) => subordinate.supervisorId === employee.id).map((user) => {
                            return (
                                <Accordion
                                    key={user.id}
                                    disableGutters
                                    sx={{ marginLeft: "20px" }}
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
                                            {`${user.firstName} ${user.lastName}`}
                                        </div>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Divider />
                                        <Grid container>
                                            {STATUS_GROUPS.map((statusGroup) => {
                                                return (
                                                    <Grid xs={12} sm={4} spacing={2}>
                                                        <Item
                                                            onClick={() => handleClick(statusGroup, [user])}
                                                            sx={{
                                                                margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                                                transition: "transform 0.1s ease-in-out",
                                                                "&:hover": {
                                                                    transform: "scale3d(1.05, 1.05, 1)"
                                                                }
                                                            }}>
                                                            <Typography>
                                                                {`${statusGroup}:`}
                                                            </Typography>
                                                            <Typography>
                                                                {partsReqs ? calcStatus(partsReqs, statusGroup, `${user.firstName} ${user.lastName}`) : 0}
                                                            </Typography>
                                                        </Item>
                                                    </Grid>
                                                )
                                            })}
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            )
                        })}
                    </Accordion>
                )
            }) : null
        )
    } else if (group === "Supply Chain") {
        return (
            <Paper sx={{ padding: "5px" }}>
                <Grid container>
                    {SC_GROUPS.map((statusGroup) => {
                        return (
                            <Grid xs={12} sm={4} spacing={2}>
                                <Item
                                    onClick={() => handleClick(statusGroup)}
                                    sx={{
                                        margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                        transition: "transform 0.1s ease-in-out",
                                        "&:hover": {
                                            transform: "scale3d(1.03, 1.03, 1)"
                                        }
                                    }}>
                                    <Typography>
                                        {`${statusGroup}:`}
                                    </Typography>
                                    <Typography>
                                        {partsReqs ? calcStatus(partsReqs, statusGroup) : 0}
                                    </Typography>
                                </Item>
                            </Grid>
                        )
                    })}
                </Grid>
            </Paper>
        )
    } else if (group === "Supply Chain Director" || group === "IT") {
        return (
            <Paper sx={{ padding: "5px" }}>
                <Grid container>
                    {STATUS_GROUPS.map((statusGroup) => {
                        return (
                            <Grid xs={12} sm={4} spacing={2}>
                                <Item
                                    onClick={() => handleClick(statusGroup)}
                                    sx={{
                                        margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                        transition: "transform 0.1s ease-in-out",
                                        "&:hover": {
                                            transform: "scale3d(1.03, 1.03, 1)"
                                        }
                                    }}>
                                    <Typography>
                                        {`${statusGroup}:`}
                                    </Typography>
                                    <Typography>
                                        {partsReqs ? calcStatus(partsReqs, statusGroup) : 0}
                                    </Typography>
                                </Item>
                            </Grid>
                        )
                    })}
                </Grid>
            </Paper>
        )
    } else {
        return null
    }
}