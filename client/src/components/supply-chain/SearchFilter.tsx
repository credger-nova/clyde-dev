import * as React from "react"

import { TITLES } from "../../utils/titles"

import { Unit } from "../../types/unit"
import { NovaUser } from "../../types/novaUser"
import { PartsReqQuery } from "../../types/partsReq"
import { AFE } from "../../types/afe"

import { useAFEs } from "../../hooks/afe"
import { useSOs } from "../../hooks/so"
import { useCustomers, useLocations, useRegions, useUnits } from "../../hooks/unit"
import { useTrucks } from "../../hooks/truck"
import { useAllNovaUsers } from "../../hooks/user"
//import { useParts } from "../../hooks/parts"

import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Unstable_Grid2'
import Box from '@mui/material/Box'
import Autocomplete from '@mui/material/Autocomplete'
import { StyledTextField } from "../common/TextField"
import parse from 'autosuggest-highlight/parse'
import match from 'autosuggest-highlight/match'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'

const OPS_VP_TITLES = TITLES.find(item => item.group === "Ops Vice President")?.titles ?? []

const URGENCY = ["Unit Down", "Unit Set", "Rush", "Standard"]
const STATUS = ["Pending Approval", "Pending Quote", "Quote Provided - Pending Approval", "Rejected - Adjustments Required", "Approved - On Hold", "Approved", "Sourcing - In Progress",
    "Sourcing - Information Required", "Sourcing - Information Provided", "Sourcing - Pending Amex Approval", "Sourcing - Request to Cancel", "Ordered - Awaiting Parts",
    "Completed - Parts Staged/Delivered", "Closed - Partially Received", "Closed - Parts in Hand", "Rejected - Closed", "Closed - Order Canceled"]

interface Props {
    partsReqQuery: PartsReqQuery,
    setPartsReqQuery: React.Dispatch<React.SetStateAction<PartsReqQuery>>,
    initialStatuses: Array<string>,
    initialRequesters: Array<NovaUser>,
    initialRegion: string,
    initialUrgency: string,
    novaUser: NovaUser | undefined,
    vpApproval: boolean,
    setVpApproval: React.Dispatch<React.SetStateAction<boolean>>
}

const StyledSwitch = styled(Switch)(() => ({
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: "#00ff00",
    },
}))

export default function SearchFilter(props: Props) {
    const { partsReqQuery, setPartsReqQuery, initialStatuses, initialRequesters, initialRegion, initialUrgency, novaUser, vpApproval, setVpApproval } = props

    const { data: afeNumbers, isFetching: afeFetching } = useAFEs()
    const { data: soNumbers, isFetching: soFetching } = useSOs()
    const { data: unitNumbers, isFetching: unitsFetching } = useUnits()
    const { data: trucks, isFetching: trucksFetching } = useTrucks()
    //const { data: parts, isFetching: partsFetching } = useParts() // TODO: add search/filter by part # - ON HOLD
    const { data: requesters, isFetching: requestersFetching } = useAllNovaUsers()
    const { data: customers, isFetching: customersFetching } = useCustomers()
    const { data: locations, isFetching: locationsFetching } = useLocations()
    const { data: regions, isFetching: regionsFetching } = useRegions()

    const handleSearchStringChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPartsReqQuery(prevState => ({
            ...prevState,
            searchString: event.target.value
        }))
    }

    const handleAfeChange = (_e: React.SyntheticEvent<Element, Event>, value: Array<AFE>) => {
        setPartsReqQuery(prevState => ({
            ...prevState,
            afe: value.map((val) => val.id)
        }))
    }

    const handleSoChange = (_e: React.SyntheticEvent<Element, Event>, value: Array<string>) => {
        setPartsReqQuery(prevState => ({
            ...prevState,
            so: value
        }))
    }

    const handleUnitChange = (_e: React.SyntheticEvent<Element, Event>, value: Array<Unit>) => {
        setPartsReqQuery(prevState => ({
            ...prevState,
            unitNumber: value.map(item => item.unitNumber)
        }))
    }

    const handleTruckChange = (_e: React.SyntheticEvent<Element, Event>, value: Array<string>) => {
        setPartsReqQuery(prevState => ({
            ...prevState,
            truck: value
        }))
    }

    const handleUrgencyChange = (_e: React.SyntheticEvent<Element, Event>, value: Array<string>) => {
        setPartsReqQuery(prevState => ({
            ...prevState,
            urgency: value
        }))
    }

    const handleStatusChange = (_e: React.SyntheticEvent<Element, Event>, value: Array<string>) => {
        setPartsReqQuery(prevState => ({
            ...prevState,
            status: value
        }))
    }

    const handleRequesterChange = (_e: React.SyntheticEvent<Element, Event>, value: Array<NovaUser>) => {
        setPartsReqQuery(prevState => ({
            ...prevState,
            requester: value.map((requester) => requester.id)
        }))
    }

    const handleCustomerChange = (_e: React.SyntheticEvent<Element, Event>, value: Array<string>) => {
        setPartsReqQuery(prevState => ({
            ...prevState,
            customer: value
        }))
    }

    const handleLocationChange = (_e: React.SyntheticEvent<Element, Event>, value: Array<string>) => {
        setPartsReqQuery(prevState => ({
            ...prevState,
            location: value
        }))
    }

    const handleRegionChange = (_e: React.SyntheticEvent<Element, Event>, value: Array<string>) => {
        setPartsReqQuery(prevState => ({
            ...prevState,
            region: value
        }))
    }

    const handleVpApprovalChange = () => {
        setPartsReqQuery(prevState => ({
            ...prevState,
            vpApproval: !vpApproval
        }))

        setVpApproval(!vpApproval)
    }

    return (
        <div style={{ display: "flex" }}>
            <Box
                sx={{ padding: "10px", backgroundColor: "background.paper", width: "100%" }}
            >
                <Grid
                    container
                    direction={"row"}
                    spacing={2}
                    justifyContent={"flex-start"}
                    sx={{ width: "100%" }}
                >
                    <Grid>
                        <StyledTextField
                            variant="standard"
                            label="Search"
                            placeholder="Name, Unit #, AFE #, etc..."
                            type="search"
                            size="small"
                            onChange={handleSearchStringChange}
                            value={partsReqQuery.searchString}
                            InputLabelProps={{
                                shrink: true
                            }}
                            sx={{ width: "330px" }}
                        />
                    </Grid>
                    <Grid>
                        <Autocomplete
                            multiple
                            filterSelectedOptions
                            limitTags={3}
                            size="small"
                            options={afeNumbers ? afeNumbers : []}
                            getOptionLabel={(option) => option.number}
                            loading={afeFetching}
                            onChange={handleAfeChange}
                            renderInput={(params) => <StyledTextField
                                {...params}
                                variant="standard"
                                label="AFE #"
                            />}
                            sx={{ width: "330px" }}
                            renderOption={(props, option, { inputValue }) => {
                                const matches = match(option.number, inputValue, { insideWords: true, requireMatchAll: true });
                                const parts = parse(option.number, matches);

                                return (
                                    <li {...props}>
                                        <div>
                                            {parts.map((part, index) => (
                                                <span
                                                    key={index}
                                                    style={{
                                                        fontWeight: part.highlight ? 700 : 400,
                                                        color: part.highlight ? "#23aee5" : "#fff"
                                                    }}
                                                >
                                                    {part.text}
                                                </span>
                                            ))}
                                        </div>
                                    </li>
                                );
                            }}
                        />
                    </Grid>
                    <Grid>
                        <Autocomplete
                            multiple
                            filterSelectedOptions
                            limitTags={3}
                            size="small"
                            options={soNumbers ? soNumbers : []}
                            loading={soFetching}
                            onChange={handleSoChange}
                            renderInput={(params) => <StyledTextField
                                {...params}
                                variant="standard"
                                label="SO #"
                            />}
                            sx={{ width: "330px" }}
                            renderOption={(props, option, { inputValue }) => {
                                const matches = match(option, inputValue, { insideWords: true, requireMatchAll: true });
                                const parts = parse(option, matches);

                                return (
                                    <li {...props}>
                                        <div>
                                            {parts.map((part, index) => (
                                                <span
                                                    key={index}
                                                    style={{
                                                        fontWeight: part.highlight ? 700 : 400,
                                                        color: part.highlight ? "#23aee5" : "#fff"
                                                    }}
                                                >
                                                    {part.text}
                                                </span>
                                            ))}
                                        </div>
                                    </li>
                                );
                            }}
                        />
                    </Grid>
                    <Grid>
                        <Autocomplete
                            multiple
                            filterSelectedOptions
                            limitTags={3}
                            size="small"
                            options={unitNumbers ? unitNumbers : []}
                            getOptionLabel={(option: Unit) => option.unitNumber}
                            loading={unitsFetching}
                            onChange={handleUnitChange}
                            renderInput={(params) => <StyledTextField
                                {...params}
                                variant="standard"
                                label="Unit #"
                            />}
                            sx={{ width: "330px" }}
                            renderOption={(props, option, { inputValue }) => {
                                const matches = match(option.unitNumber, inputValue, { insideWords: true, requireMatchAll: true });
                                const parts = parse(option.unitNumber, matches);

                                return (
                                    <li {...props}>
                                        <div>
                                            {parts.map((part, index) => (
                                                <span
                                                    key={index}
                                                    style={{
                                                        fontWeight: part.highlight ? 700 : 400,
                                                        color: part.highlight ? "#23aee5" : "#fff"
                                                    }}
                                                >
                                                    {part.text}
                                                </span>
                                            ))}
                                        </div>
                                    </li>
                                );
                            }}
                        />
                    </Grid>
                    <Grid>
                        <Autocomplete
                            multiple
                            filterSelectedOptions
                            limitTags={3}
                            size="small"
                            options={trucks ? trucks : []}
                            loading={trucksFetching}
                            onChange={handleTruckChange}
                            renderInput={(params) => <StyledTextField
                                {...params}
                                variant="standard"
                                label="Truck #"
                            />}
                            sx={{ width: "330px" }}
                            renderOption={(props, option, { inputValue }) => {
                                const matches = match(option, inputValue, { insideWords: true, requireMatchAll: true });
                                const parts = parse(option, matches);

                                return (
                                    <li {...props}>
                                        <div>
                                            {parts.map((part, index) => (
                                                <span
                                                    key={index}
                                                    style={{
                                                        fontWeight: part.highlight ? 700 : 400,
                                                        color: part.highlight ? "#23aee5" : "#fff"
                                                    }}
                                                >
                                                    {part.text}
                                                </span>
                                            ))}
                                        </div>
                                    </li>
                                );
                            }}
                        />
                    </Grid>
                    <Grid>
                        <Autocomplete
                            multiple
                            filterSelectedOptions
                            limitTags={3}
                            size="small"
                            options={URGENCY}
                            defaultValue={initialUrgency ? [initialUrgency] : []}
                            onChange={handleUrgencyChange}
                            renderInput={(params) => <StyledTextField
                                {...params}
                                variant="standard"
                                label="Urgency"
                            />}
                            sx={{ width: "330px" }}
                            renderOption={(props, option, { inputValue }) => {
                                const matches = match(option, inputValue, { insideWords: true, requireMatchAll: true });
                                const parts = parse(option, matches);

                                return (
                                    <li {...props}>
                                        <div>
                                            {parts.map((part, index) => (
                                                <span
                                                    key={index}
                                                    style={{
                                                        fontWeight: part.highlight ? 700 : 400,
                                                        color: part.highlight ? "#23aee5" : "#fff"
                                                    }}
                                                >
                                                    {part.text}
                                                </span>
                                            ))}
                                        </div>
                                    </li>
                                );
                            }}
                        />
                    </Grid>
                    <Grid>
                        <Autocomplete
                            multiple
                            filterSelectedOptions
                            limitTags={3}
                            size="small"
                            options={STATUS}
                            defaultValue={initialStatuses ?? []}
                            onChange={handleStatusChange}
                            renderInput={(params) => <StyledTextField
                                {...params}
                                variant="standard"
                                label="Status"
                            />}
                            sx={{ width: "330px" }}
                            renderOption={(props, option, { inputValue }) => {
                                const matches = match(option, inputValue, { insideWords: true, requireMatchAll: true });
                                const parts = parse(option, matches);

                                return (
                                    <li {...props}>
                                        <div>
                                            {parts.map((part, index) => (
                                                <span
                                                    key={index}
                                                    style={{
                                                        fontWeight: part.highlight ? 700 : 400,
                                                        color: part.highlight ? "#23aee5" : "#fff"
                                                    }}
                                                >
                                                    {part.text}
                                                </span>
                                            ))}
                                        </div>
                                    </li>
                                );
                            }}
                        />
                    </Grid>
                    <Grid>
                        <Autocomplete
                            multiple
                            filterSelectedOptions
                            limitTags={3}
                            size="small"
                            options={requesters ? requesters : []}
                            defaultValue={initialRequesters ?? []}
                            getOptionLabel={(option: NovaUser) => `${option.firstName} ${option.lastName}`}
                            loading={requestersFetching}
                            onChange={handleRequesterChange}
                            renderInput={(params) => <StyledTextField
                                {...params}
                                variant="standard"
                                label="Requester"
                            />}
                            sx={{ width: "330px" }}
                            renderOption={(props, option, { inputValue }) => {
                                const matches = match((option.firstName + " " + option.lastName), inputValue, { insideWords: true, requireMatchAll: true });
                                const parts = parse((option.firstName + " " + option.lastName), matches);

                                return (
                                    <li {...props}>
                                        <div>
                                            {parts.map((part, index) => (
                                                <span
                                                    key={index}
                                                    style={{
                                                        fontWeight: part.highlight ? 700 : 400,
                                                        color: part.highlight ? "#23aee5" : "#fff"
                                                    }}
                                                >
                                                    {part.text}
                                                </span>
                                            ))}
                                        </div>
                                    </li>
                                );
                            }}
                        />
                    </Grid>
                    <Grid>
                        <Autocomplete
                            multiple
                            filterSelectedOptions
                            limitTags={3}
                            size="small"
                            options={customers ? customers : []}
                            loading={customersFetching}
                            onChange={handleCustomerChange}
                            renderInput={(params) => <StyledTextField
                                {...params}
                                variant="standard"
                                label="Customer"
                            />}
                            sx={{ width: "330px" }}
                            renderOption={(props, option, { inputValue }) => {
                                const matches = match(option, inputValue, { insideWords: true, requireMatchAll: true });
                                const parts = parse(option, matches);

                                return (
                                    <li {...props}>
                                        <div>
                                            {parts.map((part, index) => (
                                                <span
                                                    key={index}
                                                    style={{
                                                        fontWeight: part.highlight ? 700 : 400,
                                                        color: part.highlight ? "#23aee5" : "#fff"
                                                    }}
                                                >
                                                    {part.text}
                                                </span>
                                            ))}
                                        </div>
                                    </li>
                                );
                            }}
                        />
                    </Grid>
                    <Grid>
                        <Autocomplete
                            multiple
                            filterSelectedOptions
                            limitTags={3}
                            size="small"
                            options={locations ? locations : []}
                            loading={locationsFetching}
                            onChange={handleLocationChange}
                            renderInput={(params) => <StyledTextField
                                {...params}
                                variant="standard"
                                label="Location"
                            />}
                            sx={{ width: "330px" }}
                            renderOption={(props, option, { inputValue }) => {
                                const matches = match(option, inputValue, { insideWords: true, requireMatchAll: true });
                                const parts = parse(option, matches);

                                return (
                                    <li {...props}>
                                        <div>
                                            {parts.map((part, index) => (
                                                <span
                                                    key={index}
                                                    style={{
                                                        fontWeight: part.highlight ? 700 : 400,
                                                        color: part.highlight ? "#23aee5" : "#fff"
                                                    }}
                                                >
                                                    {part.text}
                                                </span>
                                            ))}
                                        </div>
                                    </li>
                                );
                            }}
                        />
                    </Grid>
                    <Grid>
                        <Autocomplete
                            multiple
                            filterSelectedOptions
                            limitTags={3}
                            size="small"
                            options={regions ? regions : []}
                            defaultValue={initialRegion ? [initialRegion.toUpperCase()] : []}
                            loading={regionsFetching}
                            onChange={handleRegionChange}
                            renderInput={(params) => <StyledTextField
                                {...params}
                                variant="standard"
                                label="Region"
                            />}
                            sx={{ width: "330px" }}
                            renderOption={(props, option, { inputValue }) => {
                                const matches = match(option, inputValue, { insideWords: true, requireMatchAll: true });
                                const parts = parse(option, matches);

                                return (
                                    <li {...props}>
                                        <div>
                                            {parts.map((part, index) => (
                                                <span
                                                    key={index}
                                                    style={{
                                                        fontWeight: part.highlight ? 700 : 400,
                                                        color: part.highlight ? "#23aee5" : "#fff"
                                                    }}
                                                >
                                                    {part.text}
                                                </span>
                                            ))}
                                        </div>
                                    </li>
                                );
                            }}
                        />
                    </Grid>
                    {novaUser && OPS_VP_TITLES.includes(novaUser.jobTitle) && <Grid sx={{ display: "flex", alignItems: "flex-end" }}>
                        <FormControlLabel
                            control={
                                <StyledSwitch
                                    checked={vpApproval}
                                    onChange={handleVpApprovalChange}
                                    size="medium"
                                    disableRipple
                                    sx={{ marginLeft: "10px" }}
                                />
                            }
                            label={<Typography variant="body2">Ops VP Approval Required</Typography>}
                        />
                    </Grid>}
                </Grid>
            </Box>
        </div >
    )
}