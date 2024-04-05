import * as React from "react"

import { NovaUser } from "../../../types/novaUser"
import { PartsReq, PartsReqQuery } from "../../../types/partsReq"

import { useManagersEmployees, useDirectorsEmployees } from "../../../hooks/user"
import { usePartsReqs } from "../../../hooks/partsReq"
import { useRegions } from "../../../hooks/unit"
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
import Skeleton from '@mui/material/Skeleton'
import { toTitleCase } from "../../../utils/helperFunctions"

interface Props {
    novaUser: NovaUser,
    group: string
}

interface StatusProps {
    statuses: Array<string>
}

const STATUS_GROUPS = ["Pending Approval", "Pending Quote", "Rejected", "Approved", "Sourcing", "Parts Ordered", "Parts Staged", "Closed"]
const SC_GROUPS = ["Pending Quote", "Approved", "Sourcing", "Parts Ordered", "Parts Staged"]

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "#242424",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "left",
    color: "white"
}))

function StatusSkeleton(props: StatusProps) {
    const { statuses } = props

    return (
        <Paper sx={{ padding: "5px", minWidth: "fit-conent", maxWidth: "100%" }}>
            <Grid container>
                {statuses.map(() => {
                    return (
                        <Grid xs={12} sm={4} spacing={2}>
                            <Item sx={{ margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Skeleton
                                    animation="wave"
                                    width="100%"
                                />
                            </Item>
                        </Grid>
                    )
                })}
            </Grid>
        </Paper>
    )
}

function AccordionSkeleton(props: StatusProps) {
    const { statuses } = props

    return (
        Array(5).fill(0).map((_i, index) => {
            return (
                <Accordion
                    key={index}
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
                        <Skeleton
                            animation="wave"
                            width="25%"
                        />
                    </AccordionSummary>
                    <AccordionDetails>
                        <Divider />
                        <StatusSkeleton
                            statuses={statuses}
                        />
                    </AccordionDetails>
                </Accordion>
            )
        })
    )
}

function calcStatus(partsReqs: Array<PartsReq>, statusGroup: string, requester?: string, requesterGroup?: Array<string>, region?: string) {
    let filtered: Array<PartsReq> = []

    if (statusGroup === "Pending Quote") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Pending Quote")
    } else if (statusGroup === "Pending Approval") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Pending Approval" || partsReq.status === "Quote Provided - Pending Approval")
    } else if (statusGroup === "Rejected") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Rejected - Adjustments Required")
    } else if (statusGroup === "Approved") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Approved" || partsReq.status === "Approved - On Hold")
    } else if (statusGroup === "Sourcing") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Sourcing - Information Required" || partsReq.status === "Sourcing - Information Provided" || partsReq.status === "Sourcing - Pending Approval")
    } else if (statusGroup === "Parts Ordered") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Ordered - Awaiting Parts")
    } else if (statusGroup === "Parts Staged") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Completed - Parts Staged/Delivered")
    } else if (statusGroup === "Closed") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Closed - Partially Received" || partsReq.status === "Closed - Parts in Hand" || partsReq.status === "Rejected - Closed")
    }

    if (requester) {
        filtered = filtered.filter((partsReq) => partsReq.requester === requester)
    }
    if (requesterGroup) {
        filtered = filtered.filter((partsReq) => requesterGroup.includes(partsReq.requester))
    }
    if (region) {
        filtered = filtered.filter((partsReqs) => partsReqs.region === region)
    }

    return filtered.length
}

export default function SummaryTable(props: Props) {
    const { novaUser, group } = props

    const [partsReqQuery, setPartsReqQuery] = React.useState<PartsReqQuery>({ user: novaUser })

    const { data: managersEmployees, isFetching: managersEmployeesFetching } = useManagersEmployees(novaUser)
    const { data: directorsEmployees, isFetching: directorsEmployeesFetching } = useDirectorsEmployees(novaUser)
    const { data: partsReqs, isFetching: partsReqsFetching } = usePartsReqs(partsReqQuery)
    const { data: regions, isFetching: regionsFetching } = useRegions()
    const navigate = useNavigate()

    React.useEffect(() => {
        if (!managersEmployeesFetching && group !== "Supply Chain Management") {
            setPartsReqQuery(prevState => ({
                ...prevState,
                requester: managersEmployees?.map((employee) => `${employee.firstName} ${employee.lastName}`).concat(`${novaUser.firstName} ${novaUser.lastName}`)
            }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [managersEmployeesFetching])

    const handleClick = (statusGroup: string, requesters?: Array<NovaUser>, region?: string) => {
        let statuses: Array<string> = []
        if (statusGroup === "Pending Quote") {
            statuses = ["Pending Quote"]
        } else if (statusGroup === "Pending Approval") {
            statuses = ["Pending Approval", "Quote Provided - Pending Approval"]
        } else if (statusGroup === "Rejected") {
            statuses = ["Rejected - Adjustments Required"]
        } else if (statusGroup === "Approved") {
            statuses = ["Approved", "Approved - On Hold"]
        } else if (statusGroup === "Sourcing") {
            statuses = ["Sourcing - Information Required", "Sourcing - Information Provided", "Sourcing - Pending Approval"]
        } else if (statusGroup === "Parts Ordered") {
            statuses = ["Ordered - Awaiting Parts"]
        } else if (statusGroup === "Parts Staged") {
            statuses = ["Completed - Parts Staged/Delivered"]
        } else if (statusGroup === "Closed") {
            statuses = ["Closed - Partially Received", "Closed - Parts in Hand", "Rejected - Closed"]
        }

        navigate("/supply-chain", { state: { statuses: statuses, requesters: requesters, region: region } })
    }

    if (group === "Field Service") {
        return !partsReqsFetching ? (
            <Paper sx={{ padding: "5px", minWidth: "fit-conent", maxWidth: "100%" }}>
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
        ) : <StatusSkeleton
            statuses={STATUS_GROUPS}
        />
    } else if (group === "Ops Manager") {
        return (
            <>
                {!partsReqsFetching ? (
                    <Paper sx={{ padding: "5px", minWidth: "fit-conent", maxWidth: "100%" }}>
                        <Grid container>
                            {STATUS_GROUPS.map((statusGroup) => {
                                return (
                                    <Grid xs={12} sm={4} spacing={2}>
                                        <Item
                                            onClick={() => handleClick(statusGroup, [novaUser])}
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
                ) : <StatusSkeleton
                    statuses={STATUS_GROUPS}
                />
                }
                {!managersEmployeesFetching && !partsReqsFetching ? managersEmployees?.map((employee) => {
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
                                                            transform: "scale3d(1.03, 1.03, 1)"
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
                }) :
                    <AccordionSkeleton
                        statuses={STATUS_GROUPS}
                    />
                }
            </>
        )
    } else if (group === "Ops Director") {
        return (
            !directorsEmployeesFetching && !partsReqsFetching ? directorsEmployees?.map((employee) => {
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
                                                        transform: "scale3d(1.03, 1.03, 1)"
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
                                                                    transform: "scale3d(1.03, 1.03, 1)"
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
            }) :
                <AccordionSkeleton
                    statuses={STATUS_GROUPS}
                />
        )
    } else if (group === "Supply Chain") {
        return (
            !partsReqsFetching && !regionsFetching ? regions?.map((region) => {
                region = toTitleCase(region)
                return (
                    <Accordion
                        key={region}
                        disableGutters
                        defaultExpanded={novaUser.region.includes(region) ||
                            `${novaUser.firstName} ${novaUser.lastName}` === "Chris Brooks"}
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
                                {region}
                            </div>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Divider />
                            <Grid container>
                                {SC_GROUPS.map((statusGroup) => {
                                    return (
                                        <Grid xs={12} sm={4} spacing={2}>
                                            <Item
                                                onClick={() => handleClick(statusGroup, undefined, region)}
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
                                                    {partsReqs ? calcStatus(partsReqs, statusGroup, undefined, undefined, region) : 0}
                                                </Typography>
                                            </Item>
                                        </Grid>
                                    )
                                })}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                )
            }) :
                <AccordionSkeleton
                    statuses={SC_GROUPS}
                />
        )
    } else if (group === "Supply Chain Management" || group === "SVP" || group === "Executive Management") {
        return (
            !partsReqsFetching && !regionsFetching ? regions?.map((region) => {
                region = toTitleCase(region)
                return (
                    <Grid xs={12} sm={6} sx={{ padding: "2px" }} key={region}>
                        <Accordion
                            disableGutters
                            defaultExpanded
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
                                    {region}
                                </div>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Divider />
                                <Grid container>
                                    {STATUS_GROUPS.map((statusGroup) => {
                                        return (
                                            <Grid xs={12} sm={4} spacing={2}>
                                                <Item
                                                    onClick={() => handleClick(statusGroup, undefined, region)}
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
                                                        {partsReqs ? calcStatus(partsReqs, statusGroup, undefined, undefined, region) : 0}
                                                    </Typography>
                                                </Item>
                                            </Grid>
                                        )
                                    })}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                )
            }) :
                <AccordionSkeleton
                    statuses={STATUS_GROUPS}
                />
        )
    } else if (group === "IT") {
        return !partsReqsFetching ? (
            <Paper sx={{ padding: "5px", minWidth: "fit-conent", maxWidth: "100%" }}>
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
        ) :
            <StatusSkeleton
                statuses={STATUS_GROUPS}
            />
    } else {
        return null
    }
}