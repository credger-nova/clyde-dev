import * as React from "react"

import { NovaUser } from "../../../types/novaUser"
import { PartsReq, PartsReqQuery } from "../../../types/partsReq"

import { calcCost, opsVpApprovalRequired, toTitleCase } from "../../../utils/helperFunctions"

import { useLeadsEmployees, useManagersEmployees, useDirectorsEmployees } from "../../../hooks/user"
import { usePartsReqs } from "../../../hooks/partsReq"
import { useRegions } from "../../../hooks/unit"
import { useNavigate } from "react-router-dom"

import { styled } from '@mui/material/styles'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import Skeleton from '@mui/material/Skeleton'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

interface Props {
    novaUser: NovaUser,
    group: string
}

interface StatusProps {
    statuses: Array<string>
}

const STATUS_GROUPS = ["Pending Approval", "Pending Quote", "Rejected", "Approved", "Sourcing", "Parts Ordered", "Parts Staged", "Closed"]
const SC_GROUPS = ["Pending Quote", "Approved", "Sourcing", "Parts Ordered", "Parts Staged"]

const UNIT_DOWN_STATUSES = ["Pending Approval", "Pending Quote", "Quote Provided - Pending Approval", "Rejected - Adjustments Required", "Approved - On Hold", "Approved",
    "Sourcing - In Progress", "Sourcing - Information Required", "Sourcing - Information Provided", "Sourcing - Pending Amex Approval", "Sourcing - Amex Approved",
    "Ordered - Awaiting Parts"]

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
        <Paper sx={{ padding: "5px", minWidth: "fit-content", maxWidth: "100%" }}>
            <Grid container>
                {statuses.map((status) => {
                    return (
                        <Grid xs={12} sm={4} spacing={2} key={status}>
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
        <Grid container width={"100%"}>
            {Array(5).fill(0).map((_i, index) => {
                return (
                    <Grid xs={12} sm={4} padding={"5px"}>
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
                                    width="100%"
                                />
                            </AccordionSummary>
                            <AccordionDetails>
                                <Divider />
                                <StatusSkeleton
                                    statuses={statuses}
                                />
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                )
            })}
        </Grid>
    )
}

const StyledSwitch = styled(Switch)(() => ({
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: "#00ff00",
    },
}))

function calcStatus(partsReqs: Array<PartsReq>, statusGroup: string, requester?: NovaUser, requesterGroup?: Array<NovaUser>, region?: string, opsVP?: boolean) {
    let filtered: Array<PartsReq> = []

    if (statusGroup === "Pending Quote") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Pending Quote")
    } else if (statusGroup === "Pending Approval") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Pending Approval" || partsReq.status === "Quote Provided - Pending Approval" ||
            partsReq.status === "Sourcing - Request to Cancel")
    } else if (statusGroup === "Rejected") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Rejected - Adjustments Required")
    } else if (statusGroup === "Approved") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Approved" || partsReq.status === "Approved - On Hold")
    } else if (statusGroup === "Sourcing") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Sourcing - In Progress" || partsReq.status === "Sourcing - Information Required" ||
            partsReq.status === "Sourcing - Information Provided" || partsReq.status === "Sourcing - Pending Amex Approval" || partsReq.status === "Sourcing - Amex Approved")
    } else if (statusGroup === "Parts Ordered") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Ordered - Awaiting Parts")
    } else if (statusGroup === "Parts Staged") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Completed - Parts Staged/Delivered")
    } else if (statusGroup === "Closed") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Closed - Partially Received" || partsReq.status === "Closed - Parts in Hand" ||
            partsReq.status === "Rejected - Closed" || partsReq.status === "Closed - Order Canceled")
    }

    if (requester) {
        filtered = filtered.filter((partsReq) => partsReq.requester.id === requester.id)
    }
    if (requesterGroup) {
        filtered = filtered.filter((partsReq) => requesterGroup.map((user) => user.id).includes(partsReq.requester.id))
    }
    if (region) {
        filtered = filtered.filter((partsReqs) => partsReqs.region === region)
    }
    if (opsVP) {
        filtered = filtered.filter((partsReq) => calcCost(partsReq.parts) > 10000 || opsVpApprovalRequired(partsReq.unit ?? null, partsReq.parts))
    }

    return filtered.length
}

function calcUnitDown(partsReqs: Array<PartsReq>, region: string) {
    const filtered = partsReqs.filter((partsReq) => partsReq.region === region && partsReq.urgency === "Unit Down" &&
        UNIT_DOWN_STATUSES.includes(partsReq.status)
    )

    return filtered.length
}

export default function SummaryTable(props: Props) {
    const { novaUser, group } = props

    const [partsReqQuery, setPartsReqQuery] = React.useState<PartsReqQuery>({ user: novaUser })
    const [managerOnly, setManagerOnly] = React.useState<Array<NovaUser>>([])

    const { data: leadsEmployees, isFetching: leadsEmployeesFetching } = useLeadsEmployees(novaUser)
    const { data: managersEmployees, isFetching: managersEmployeesFetching } = useManagersEmployees(novaUser)
    const { data: directorsEmployees, isFetching: directorsEmployeesFetching } = useDirectorsEmployees(novaUser)
    const { data: partsReqs, isFetching: partsReqsFetching } = usePartsReqs(partsReqQuery)
    const { data: regions, isFetching: regionsFetching } = useRegions()
    const navigate = useNavigate()

    React.useEffect(() => {
        if (!managersEmployeesFetching && group !== "Supply Chain Management") {
            setPartsReqQuery(prevState => ({
                ...prevState,
                requester: managersEmployees?.map((employee) => employee.id).concat(novaUser.id)
            }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [managersEmployeesFetching])

    const handleClick = (statusGroup: string, requesters?: Array<NovaUser>, region?: string, urgency?: string) => {
        let statuses: Array<string> = []
        if (statusGroup === "Pending Quote") {
            statuses = ["Pending Quote"]
        } else if (statusGroup === "Pending Approval") {
            statuses = ["Pending Approval", "Quote Provided - Pending Approval", "Sourcing - Request to Cancel"]
        } else if (statusGroup === "Rejected") {
            statuses = ["Rejected - Adjustments Required"]
        } else if (statusGroup === "Approved") {
            statuses = ["Approved", "Approved - On Hold"]
        } else if (statusGroup === "Sourcing") {
            statuses = ["Sourcing - In Progress", "Sourcing - Information Required", "Sourcing - Information Provided", "Sourcing - Pending Amex Approval",
                "Sourcing - Amex Approved", "Sourcing - Request to Cancel"]
        } else if (statusGroup === "Parts Ordered") {
            statuses = ["Ordered - Awaiting Parts"]
        } else if (statusGroup === "Parts Staged") {
            statuses = ["Completed - Parts Staged/Delivered"]
        } else if (statusGroup === "Closed") {
            statuses = ["Closed - Partially Received", "Closed - Parts in Hand", "Rejected - Closed", "Closed - Order Canceled"]
        } else if (statusGroup === "Unit Down") {
            statuses = UNIT_DOWN_STATUSES
        }

        navigate("/supply-chain", { state: { statuses: statuses, requesters: requesters, region: region, urgency: urgency } })
    }

    const handleManagerOnlyChange = (event: React.ChangeEvent<HTMLInputElement>, manager: NovaUser) => {
        if (event.target.checked) {
            setManagerOnly([...managerOnly, manager])
        } else {
            const tempManagers = [...managerOnly]
            tempManagers.splice(tempManagers.indexOf(manager), 1)
            setManagerOnly(tempManagers)
        }
    }

    if (group === "Field Service") {
        return (
            <>
                {!partsReqsFetching ? (
                    <Paper sx={{ padding: "5px", minWidth: "fit-content", maxWidth: "100%" }}>
                        <Grid container>
                            {STATUS_GROUPS.map((statusGroup) => {
                                return (
                                    <Grid xs={12} sm={4} spacing={2} key={statusGroup}>
                                        <Item
                                            onClick={() => handleClick(statusGroup, [novaUser])}
                                            sx={{
                                                margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                                transition: "transform 0.1s ease-in-out",
                                                "&:hover": {
                                                    transform: "scale3d(1.03, 1.03, 1)"
                                                }
                                            }}>
                                            <Typography variant="subtitle2" fontWeight="400">
                                                {`${statusGroup}:`}
                                            </Typography>
                                            <Typography variant="subtitle2" fontWeight="400">
                                                {partsReqs ? calcStatus(partsReqs, statusGroup, novaUser) : 0}
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
                {!leadsEmployeesFetching && !partsReqsFetching ? leadsEmployees?.map((employee) => {
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
                                            <Grid xs={12} sm={4} spacing={2} key={statusGroup}>
                                                <Item
                                                    onClick={() => handleClick(statusGroup, [employee])}
                                                    sx={{
                                                        margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                                        transition: "transform 0.1s ease-in-out",
                                                        "&:hover": {
                                                            transform: "scale3d(1.03, 1.03, 1)"
                                                        }
                                                    }}>
                                                    <Typography variant="subtitle2" fontWeight="400">
                                                        {`${statusGroup}:`}
                                                    </Typography>
                                                    <Typography variant="subtitle2" fontWeight="400">
                                                        {partsReqs ? calcStatus(partsReqs, statusGroup, employee) : 0}
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
    } else if (group === "Ops Manager") {
        return (
            <>
                {!partsReqsFetching ? (
                    <Paper sx={{ padding: "5px", minWidth: "fit-content", maxWidth: "100%" }}>
                        <FormControlLabel
                            control={
                                <StyledSwitch
                                    checked={managerOnly.includes(novaUser)}
                                    onChange={(event) => handleManagerOnlyChange(event, novaUser)}
                                    size="medium"
                                    disableRipple
                                    sx={{ marginLeft: "10px" }}
                                />
                            }
                            label={<Typography variant="body2">Submitted By Me Only</Typography>}
                        />
                        <Grid container>
                            {STATUS_GROUPS.map((statusGroup) => {
                                return (
                                    <Grid xs={12} sm={4} spacing={2} key={statusGroup}>
                                        <Item
                                            onClick={() => handleClick(statusGroup, managerOnly.includes(novaUser) ? [novaUser] : [novaUser].concat(managersEmployees!))}
                                            sx={{
                                                margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                                transition: "transform 0.1s ease-in-out",
                                                "&:hover": {
                                                    transform: "scale3d(1.03, 1.03, 1)"
                                                }
                                            }}>
                                            <Typography variant="subtitle2" fontWeight="400">
                                                {`${statusGroup}:`}
                                            </Typography>
                                            <Typography variant="subtitle2" fontWeight="400">
                                                {partsReqs ? calcStatus(partsReqs, statusGroup, undefined, managerOnly.includes(novaUser) ?
                                                    [novaUser] :
                                                    managersEmployees?.filter((subordinate) => subordinate.supervisorId === novaUser.id).concat(novaUser)
                                                ) : 0}
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
                                            <Grid xs={12} sm={4} spacing={2} key={statusGroup}>
                                                <Item
                                                    onClick={() => handleClick(statusGroup, [employee])}
                                                    sx={{
                                                        margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                                        transition: "transform 0.1s ease-in-out",
                                                        "&:hover": {
                                                            transform: "scale3d(1.03, 1.03, 1)"
                                                        }
                                                    }}>
                                                    <Typography variant="subtitle2" fontWeight="400">
                                                        {`${statusGroup}:`}
                                                    </Typography>
                                                    <Typography variant="subtitle2" fontWeight="400">
                                                        {partsReqs ? calcStatus(partsReqs, statusGroup, employee) : 0}
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
            novaUser.region.length > 1 ? novaUser.region.map((region) => {
                return (
                    <Accordion
                        key={region}
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
                                <b>{region}</b>
                            </div>
                        </AccordionSummary>
                        <AccordionDetails>
                            {!directorsEmployeesFetching && !partsReqsFetching ? directorsEmployees?.map((employee) => {
                                return (
                                    employee.jobTitle.includes("Manager") && employee.region.includes(region) && <Accordion
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
                                            <FormControlLabel
                                                control={
                                                    <StyledSwitch
                                                        checked={managerOnly.includes(employee)}
                                                        onChange={(event) => handleManagerOnlyChange(event, employee)}
                                                        size="medium"
                                                        disableRipple
                                                    />
                                                }
                                                label={<Typography variant="body2">Submitted By Manager Only</Typography>}
                                            />
                                            <Divider />
                                            <Grid container>
                                                {STATUS_GROUPS.map((statusGroup) => {
                                                    return (
                                                        <Grid xs={12} sm={4} spacing={2} key={statusGroup}>
                                                            <Item
                                                                onClick={() => handleClick(statusGroup, managerOnly.includes(employee) ? [employee] :
                                                                    directorsEmployees.filter((subordinate) => subordinate.supervisorId === employee.id).concat(employee))}
                                                                sx={{
                                                                    margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                                                    transition: "transform 0.1s ease-in-out",
                                                                    "&:hover": {
                                                                        transform: "scale3d(1.03, 1.03, 1)"
                                                                    }
                                                                }}>
                                                                <Typography variant="subtitle2" fontWeight="400">
                                                                    {`${statusGroup}:`}
                                                                </Typography>
                                                                <Typography variant="subtitle2" fontWeight="400">
                                                                    {partsReqs ? calcStatus(partsReqs, statusGroup, undefined, managerOnly.includes(employee) ?
                                                                        [employee] :
                                                                        directorsEmployees.filter((subordinate) => subordinate.supervisorId === employee.id).concat(employee)
                                                                    ) : 0}
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
                                                                    <Grid xs={12} sm={4} spacing={2} key={statusGroup}>
                                                                        <Item
                                                                            onClick={() => handleClick(statusGroup, [user])}
                                                                            sx={{
                                                                                margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                                                                transition: "transform 0.1s ease-in-out",
                                                                                "&:hover": {
                                                                                    transform: "scale3d(1.03, 1.03, 1)"
                                                                                }
                                                                            }}>
                                                                            <Typography variant="subtitle2" fontWeight="400">
                                                                                {`${statusGroup}:`}
                                                                            </Typography>
                                                                            <Typography variant="subtitle2" fontWeight="400">
                                                                                {partsReqs ? calcStatus(partsReqs, statusGroup, user) : 0}
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
                            }
                        </AccordionDetails>
                    </Accordion>
                )
            }) : !directorsEmployeesFetching && !partsReqsFetching ? directorsEmployees?.map((employee) => {
                return (
                    employee.jobTitle.includes("Manager") && <Accordion
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
                            <FormControlLabel
                                control={
                                    <StyledSwitch
                                        checked={managerOnly.includes(employee)}
                                        onChange={(event) => handleManagerOnlyChange(event, employee)}
                                        size="medium"
                                        disableRipple
                                    />
                                }
                                label={<Typography variant="body2">Submitted By Manager Only</Typography>}
                            />
                            <Divider />
                            <Grid container>
                                {STATUS_GROUPS.map((statusGroup) => {
                                    return (
                                        <Grid xs={12} sm={4} spacing={2} key={statusGroup}>
                                            <Item
                                                onClick={() => handleClick(statusGroup, managerOnly.includes(employee) ? [employee] :
                                                    directorsEmployees.filter((subordinate) => subordinate.supervisorId === employee.id).concat(employee))}
                                                sx={{
                                                    margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                                    transition: "transform 0.1s ease-in-out",
                                                    "&:hover": {
                                                        transform: "scale3d(1.03, 1.03, 1)"
                                                    }
                                                }}>
                                                <Typography variant="subtitle2" fontWeight="400">
                                                    {`${statusGroup}:`}
                                                </Typography>
                                                <Typography variant="subtitle2" fontWeight="400">
                                                    {partsReqs ? calcStatus(partsReqs, statusGroup, undefined, managerOnly.includes(employee) ?
                                                        [employee] :
                                                        directorsEmployees.filter((subordinate) => subordinate.supervisorId === employee.id).concat(employee)
                                                    ) : 0}
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
                                                    <Grid xs={12} sm={4} spacing={2} key={statusGroup}>
                                                        <Item
                                                            onClick={() => handleClick(statusGroup, [user])}
                                                            sx={{
                                                                margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                                                transition: "transform 0.1s ease-in-out",
                                                                "&:hover": {
                                                                    transform: "scale3d(1.03, 1.03, 1)"
                                                                }
                                                            }}>
                                                            <Typography variant="subtitle2" fontWeight="400">
                                                                {`${statusGroup}:`}
                                                            </Typography>
                                                            <Typography variant="subtitle2" fontWeight="400">
                                                                {partsReqs ? calcStatus(partsReqs, statusGroup, user) : 0}
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
    } else if (group === "Ops Vice President") {
        return (
            !partsReqsFetching && !regionsFetching ? regions?.map((region) => {
                region = toTitleCase(region)
                return (
                    <Grid xs={12} sm={6} sx={{ padding: "2px", marginBottom: "5px" }} key={region}>
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
                                        margin: 0
                                    }
                                }}
                            >
                                <h4 style={{ margin: 0 }}>
                                    {region}
                                </h4>
                            </AccordionSummary>
                            <AccordionDetails sx={{ padding: "8px" }}>
                                <Divider />
                                <Grid container>
                                    <Grid xs={12} sm={4}>
                                        <Item
                                            onClick={() => handleClick("Pending Approval", undefined, region)}
                                            sx={{
                                                margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                                transition: "transform 0.1s ease-in-out",
                                                "&:hover": {
                                                    transform: "scale3d(1.03, 1.03, 1)"
                                                }
                                            }}>
                                            <Typography variant="subtitle2" fontWeight="400">
                                                {`Pending Approval:`}
                                            </Typography>
                                            <Typography variant="subtitle2" fontWeight="400">
                                                {partsReqs ? calcStatus(partsReqs, "Pending Approval", undefined, undefined, region, true) : 0}
                                            </Typography>
                                        </Item>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                )
            }) : <AccordionSkeleton
                statuses={["Pending Approval"]}
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
                        defaultExpanded={novaUser.region.includes(region)}
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
                                        <Grid xs={12} sm={4} spacing={2} key={statusGroup}>
                                            <Item
                                                onClick={() => handleClick(statusGroup, undefined, region)}
                                                sx={{
                                                    margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                                    transition: "transform 0.1s ease-in-out",
                                                    "&:hover": {
                                                        transform: "scale3d(1.03, 1.03, 1)"
                                                    }
                                                }}>
                                                <Typography variant="subtitle2" fontWeight="400">
                                                    {`${statusGroup}:`}
                                                </Typography>
                                                <Typography variant="subtitle2" fontWeight="400">
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
    } else if (group === "Supply Chain Management" || group === "Executive Management" || group === "IT" || group === "Admin") {
        return (
            !partsReqsFetching && !regionsFetching ? regions?.map((region) => {
                region = toTitleCase(region)
                return (
                    <Grid xs={12} sm={6} sx={{ padding: "2px", marginBottom: "5px" }} key={region}>
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
                                        margin: 0
                                    }
                                }}
                            >
                                <h4 style={{ margin: 0 }}>
                                    {region}
                                </h4>
                            </AccordionSummary>
                            <AccordionDetails sx={{ padding: "8px" }}>
                                <Divider />
                                <Grid container>
                                    {STATUS_GROUPS.map((statusGroup) => {
                                        return (
                                            <Grid xs={12} sm={4} spacing={2} key={statusGroup}>
                                                <Item
                                                    onClick={() => handleClick(statusGroup, undefined, region)}
                                                    sx={{
                                                        margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                                        transition: "transform 0.1s ease-in-out",
                                                        "&:hover": {
                                                            transform: "scale3d(1.03, 1.03, 1)"
                                                        }
                                                    }}>
                                                    <Typography variant="subtitle2" fontWeight="400">
                                                        {`${statusGroup}:`}
                                                    </Typography>
                                                    <Typography variant="subtitle2" fontWeight="400">
                                                        {partsReqs ? calcStatus(partsReqs, statusGroup, undefined, undefined, region) : 0}
                                                    </Typography>
                                                </Item>
                                            </Grid>
                                        )
                                    })}
                                </Grid>
                                <Divider />
                                <Grid xs={12} sm={4} spacing={2} key={region}>
                                    <Item
                                        onClick={() => handleClick("Unit Down", undefined, region, "Unit Down")}
                                        sx={{
                                            margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                            transition: "transform 0.1s ease-in-out",
                                            "&:hover": {
                                                transform: "scale3d(1.03, 1.03, 1)"
                                            }
                                        }}
                                    >
                                        <Typography variant="subtitle2" fontWeight="400">
                                            {`Unit Down: `}
                                        </Typography>
                                        <Typography variant="subtitle2" fontWeight="400">
                                            {partsReqs ? calcUnitDown(partsReqs, region) : 0}
                                        </Typography>
                                    </Item>
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
    } else if (group === "") {
        return !partsReqsFetching ? (
            <Paper sx={{ padding: "5px", minWidth: "fit-content", maxWidth: "100%" }}>
                <Grid container>
                    {STATUS_GROUPS.map((statusGroup) => {
                        return (
                            <Grid xs={12} sm={4} spacing={2} key={statusGroup}>
                                <Item
                                    onClick={() => handleClick(statusGroup)}
                                    sx={{
                                        margin: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                                        transition: "transform 0.1s ease-in-out",
                                        "&:hover": {
                                            transform: "scale3d(1.03, 1.03, 1)"
                                        }
                                    }}>
                                    <Typography variant="subtitle2" fontWeight="400">
                                        {`${statusGroup}:`}
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight="400">
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