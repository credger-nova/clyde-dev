import * as React from "react"

import { NovaUser } from "../../../types/kpa/novaUser"
import { PartsReq, PartsReqQuery } from "../../../types/partsReq"

import {toTitleCase } from "../../../utils/helperFunctions"

import { useLeadsEmployees, useManagersEmployees, useDirectorsEmployees } from "../../../hooks/kpa/user"
import { usePartsReqs } from "../../../hooks/partsReq"
import { useRegions } from "../../../hooks/unit"
import { useNavigate } from "react-router-dom"
import { useAuth0Token } from "../../../hooks/utils"
import { TITLES } from "../../../utils/titles"

import { styled } from "@mui/material/styles"
import Accordion from "@mui/material/Accordion"
import AccordionDetails from "@mui/material/AccordionDetails"
import AccordionSummary from "@mui/material/AccordionSummary"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Divider from "@mui/material/Divider"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import Grid from "@mui/material/Unstable_Grid2"
import Skeleton from "@mui/material/Skeleton"
import Switch from "@mui/material/Switch"
import FormControlLabel from "@mui/material/FormControlLabel"
import L6PartsReq from "./L6PartsReq"

import { STATUS_GROUPS, SC_GROUPS, PERSONNEL_GROUPS } from "./lookupTables"
import { calcStatus, calcStatusV2, calcUnitDown, calcUnitDownV2, handleClick, getPartsReqsByUser, getPartsReqsByUserGroup } from "./dashboardFunctions"
import { Box } from "@mui/material"
import RegionToggleButton from "./RegionToggleButton"
import L3 from "./L3"
import L1 from "./L1"
import L2 from "./L2"

interface Props {
    novaUser: NovaUser
    group: string
}

interface StatusProps {
    statuses: Array<string>
}

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "#242424",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "left",
    color: "white",
}))

function StatusSkeleton(props: StatusProps) {
    const { statuses } = props

    return (
        <Paper sx={{ padding: "5px", minWidth: "fit-content", maxWidth: "100%" }}>
            <Grid container>
                {statuses.map((status) => {
                    return (
                        <Grid xs={12} sm={4} spacing={2} key={status}>
                            <Item
                                sx={{
                                    margin: "5px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Skeleton animation="wave" width="100%" />
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
            {Array(5)
                .fill(0)
                .map((_i, index) => {
                    return (
                        <Grid key={index} xs={12} sm={4} padding={"5px"}>
                            <Accordion disableGutters>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{
                                        flexDirection: "row-reverse",
                                        "& .MuiAccordionSummary-content": {
                                            margin: 0,
                                        },
                                        "&.MuiAccordionSummary-root": {
                                            minHeight: 0,
                                            margin: "5px 0px",
                                        },
                                    }}
                                >
                                    <Skeleton animation="wave" width="100%" />
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Divider />
                                    <StatusSkeleton statuses={statuses} />
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                    )
                })}
        </Grid>
    )
}

const StyledSwitch = styled(Switch)(() => ({
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
        backgroundColor: "#00ff00",
    },
}))

export default function SummaryTable(props: Props) {
    const { novaUser, group } = props
    const level = PERSONNEL_GROUPS[group]
    const token = useAuth0Token()
  
    const [partsReqQuery, setPartsReqQuery] = React.useState<PartsReqQuery>({ user: novaUser })
    const [managerOnly, setManagerOnly] = React.useState<Array<NovaUser>>([])

    const { data: leadsEmployees, isFetching: leadsEmployeesFetching } = useLeadsEmployees(token, novaUser)
    const { data: managersEmployees, isFetching: managersEmployeesFetching } = useManagersEmployees(token, novaUser)
    const { data: directorsEmployees, isFetching: directorsEmployeesFetching } = useDirectorsEmployees(token, novaUser)
    const { data: partsReqs, isFetching: partsReqsFetching } = usePartsReqs(token, partsReqQuery)
    const { data: regions, isFetching: regionsFetching } = useRegions(token)
    const navigate = useNavigate()
    
    React.useEffect(() => {
        if (!managersEmployeesFetching && group !== "Supply Chain Management") {
            setPartsReqQuery((prevState) => ({
                ...prevState,
                requester: managersEmployees?.map((employee) => employee.id).concat(novaUser.id),
            }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [managersEmployeesFetching])

    const handleManagerOnlyChange = (event: React.ChangeEvent<HTMLInputElement>, manager: NovaUser) => {
        if (event.target.checked) {
            setManagerOnly([...managerOnly, manager])
        } else {
            const tempManagers = [...managerOnly]
            tempManagers.splice(tempManagers.indexOf(manager), 1)
            setManagerOnly(tempManagers)
        }
    }

    function getChartsForSubordinates(leadsEmployees: Array<NovaUser>, partsReqs: Array<PartsReq>){
        const charts = leadsEmployees.map((employee) => {
            return <L6PartsReq target='novaUser' data={getPartsReqsByUser(employee, partsReqs)} novaUser={employee} region={undefined} level={level} userGroup={undefined}/>
        })

        return charts
    }

    if (level === "L1") {
        if(leadsEmployeesFetching || !partsReqs){
            return null
        }

        return (
            <L1 novaUser={novaUser} leadsEmployees={leadsEmployees} partsReqs={partsReqs}/>
        )

    }
    
    if(level === "L2") {
        if(!managersEmployees || !partsReqs){
            return null
        }

        //return <L2 novaUser={novaUser} level={level} managersEmployees={managersEmployees} partsReqs={partsReqs}/>
        return <L2 novaUser={novaUser} managersEmployees={managersEmployees} partsReqs={partsReqs}/>

    }
    
    if (level === "L3") {
        if(!partsReqs || !directorsEmployees){
            return null
        }

        return (
            <L3 novaUser = {novaUser} directorsEmployees = {directorsEmployees} partsReqs = {partsReqs} token = {token}/>
        )
    } 
    
    if (level === "L4") {
        return !partsReqsFetching && !regionsFetching ? (
            regions?.map((region) => {
                region = toTitleCase(region)
                return (
                    <Grid xs={12} sm={6} sx={{ padding: "2px", marginBottom: "5px" }} key={region}>
                        <Accordion disableGutters defaultExpanded>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    flexDirection: "row-reverse",
                                    "& .MuiAccordionSummary-content": {
                                        margin: 0,
                                    },
                                    "&.MuiAccordionSummary-root": {
                                        minHeight: 0,
                                        margin: 0,
                                    },
                                }}
                            >
                                <h4 style={{ margin: 0 }}>{region}</h4>
                            </AccordionSummary>
                            <AccordionDetails sx={{ padding: "8px" }}>
                                <Divider />
                                <Grid container>
                                    <Grid xs={12} sm={4}>
                                        <Item
                                            onClick={() => handleClick(navigate, "Pending Approval", undefined, region)}
                                            sx={{
                                                margin: "5px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                cursor: "pointer",
                                                transition: "transform 0.1s ease-in-out",
                                                "&:hover": {
                                                    transform: "scale3d(1.03, 1.03, 1)",
                                                },
                                            }}
                                        >
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
            })
        ) : (
            <AccordionSkeleton statuses={["Pending Approval"]} />
        )
    }
    
    if (level === "L5") {
        return !partsReqsFetching && !regionsFetching ? (
            regions?.map((region) => {
                region = toTitleCase(region)
                return (
                    <Accordion key={region} disableGutters defaultExpanded={novaUser.region.includes(region)}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                                flexDirection: "row-reverse",
                                "& .MuiAccordionSummary-content": {
                                    margin: 0,
                                },
                                "&.MuiAccordionSummary-root": {
                                    minHeight: 0,
                                    margin: "5px 0px",
                                },
                            }}
                        >
                            <div>{region}</div>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Divider />
                            <Grid container>
                                {SC_GROUPS.map((statusGroup) => {
                                    return (
                                        <Grid xs={12} sm={4} spacing={2} key={statusGroup}>
                                            <Item
                                                onClick={() => handleClick(navigate, statusGroup, undefined, region)}
                                                sx={{
                                                    margin: "5px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    cursor: "pointer",
                                                    transition: "transform 0.1s ease-in-out",
                                                    "&:hover": {
                                                        transform: "scale3d(1.03, 1.03, 1)",
                                                    },
                                                }}
                                            >
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
            })
        ) : (
            <AccordionSkeleton statuses={SC_GROUPS} />
        )
    }
    
    if (level === "L6") {
        if(!regions || !partsReqs){
            return null
        }

        const partsByRegion: {[key: string]: {[key: string]: number}} = {}

        for(const region of regions){
            partsByRegion[region] = {}
            for(const status of STATUS_GROUPS){
                const count = calcStatus(partsReqs, status, undefined, undefined, toTitleCase(region))
                partsByRegion[region][status] = count
            }
            partsByRegion[region]["Units Down"] = calcUnitDownV2(partsReqs, toTitleCase(region)) 
        }
        console.log('partsByRegion: ', partsByRegion)

        const regionCharts = regions.map((region) => {
            return <L6PartsReq key={region} target='region' data={partsByRegion[region]} novaUser={novaUser} region={region} level={level} userGroup={undefined}/>
        })


        return (
                <Box sx={{display: "flex", flexWrap: "wrap", gap: "24px"}}>
                    {regionCharts}
                </Box>
        )

    }
    
    if (group === "") {
        return !partsReqsFetching ? (
            <Paper sx={{ padding: "5px", minWidth: "fit-content", maxWidth: "100%" }}>
                <Grid container>
                    {STATUS_GROUPS.map((statusGroup) => {
                        return (
                            <Grid xs={12} sm={4} spacing={2} key={statusGroup}>
                                <Item
                                    onClick={() => handleClick(navigate, statusGroup)}
                                    sx={{
                                        margin: "5px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        cursor: "pointer",
                                        transition: "transform 0.1s ease-in-out",
                                        "&:hover": {
                                            transform: "scale3d(1.03, 1.03, 1)",
                                        },
                                    }}
                                >
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
        ) : (
            <StatusSkeleton statuses={STATUS_GROUPS} />
        )
    } 
    
    return null

}
