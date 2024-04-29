import * as React from "react"

import { useAuth0 } from "@auth0/auth0-react"
import { useAFEs } from "../../hooks/afe"
import { useSOs } from "../../hooks/so"
import { useUnits } from "../../hooks/unit"
import { useTrucks } from "../../hooks/truck"
import { useParts } from "../../hooks/parts"
import { useCreatePartsReq, useSumPrWithAfe } from "../../hooks/partsReq"
import { useUploadFiles } from "../../hooks/storage"
import { useNovaUser } from "../../hooks/user"
import { useWarehouses } from "../../hooks/warehouse"

import { toTitleCase, calcCost, opsVpApprovalRequired } from "../../utils/helperFunctions"
import { TITLES } from "../../utils/titles"

import { OrderRow, CreatePartsReq } from "../../types/partsReq"
import { Part } from "../../types/part"
import { Comment } from "../../types/comment"
import { Unit } from "../../types/unit"
import { NovaUser } from "../../types/novaUser"
import { AFE } from "../../types/afe"

import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Unstable_Grid2'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { StyledTextField } from "../common/TextField"
import Loader from "../common/Loader"
import InputAdornment from '@mui/material/InputAdornment'
import parse from 'autosuggest-highlight/parse'
import match from 'autosuggest-highlight/match'
import theme from "../../css/theme"
import Popper, { PopperProps } from '@mui/material/Popper'
import Files from "./Files"
import AddFileButton from "./AddFileButton"
import Checkbox from '@mui/material/Checkbox'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

const URGENCY = ["Unit Down", "Unit Set", "Rush", "Standard"]
const ORDER_TYPE = [{ type: "Rental" }, { type: "Third-Party" }, { type: "Shop Supplies" }, { type: "Truck Supplies" }, { type: "Stock", titles: ["Supply Chain", "Software"] }]
const REGION = ["Carlsbad", "Pecos", "North Permian", "South Permian", "East Texas", "South Texas", "Midcon"]

const SHOP_TITLES = TITLES.filter(item => item.group.includes("Shop")).map((group) => group.titles).flat()

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "#242424",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "left",
    color: "white"
}))

function CustomPopper(props: PopperProps) {
    return (
        <Popper
            {...props}
            placement="top-start"
            style={{ width: "75vw" }}
        >
            {props.children as React.ReactNode}
        </Popper>
    )
}

interface PartOption extends Part {
    inputValue?: string
}

export default function PartsReqForm() {
    const { user } = useAuth0()

    const { data: novaUser, isFetched } = useNovaUser(user?.email)

    const { data: afes, isFetching: afeFetching } = useAFEs()
    const { data: soNumbers, isFetching: soFetching } = useSOs()
    const { data: unitNumbers, isFetching: unitsFetching } = useUnits()
    const { data: trucks, isFetching: trucksFetching } = useTrucks()
    const { data: parts, isFetching: partsFetching } = useParts()
    const { data: locations, isFetching: locationsFetching } = useWarehouses()

    const { mutateAsync: createPartsReq } = useCreatePartsReq()
    const { mutateAsync: uploadFiles } = useUploadFiles()

    const [requester] = React.useState<NovaUser | undefined>(novaUser)
    const [orderDate] = React.useState<Date>(new Date())
    const [billable, setBillable] = React.useState<boolean>(false)
    const [quoteOnly, setQuoteOnly] = React.useState<boolean>(false)
    const [afe, setAfe] = React.useState<AFE | null>(null)
    const [so, setSo] = React.useState<string | null>(null)
    const [unit, setUnit] = React.useState<Unit | null>(null)
    const [truck, setTruck] = React.useState<string | null>(null)
    const [urgency, setUrgency] = React.useState<string | null>(null)
    const [orderType, setOrderType] = React.useState<string | null>(null)
    const [region, setRegion] = React.useState<string | null>(null)
    const [rows, setRows] = React.useState<Array<Omit<OrderRow, "id">>>([])
    const [comment, setComment] = React.useState<string>("")
    const [comments, setComments] = React.useState<Array<Omit<Comment, "id">>>([])
    const [newFiles, setNewFiles] = React.useState<Array<File>>([])
    const [deleteFiles, setDeleteFiles] = React.useState<Array<string>>([])
    const [conex, setConex] = React.useState<boolean>(false)
    const [conexName, setConexName] = React.useState<string | null>(null)
    const [disableSubmit, setDisableSubmit] = React.useState<boolean>(true)
    const [prExceedsAfe, setPrExceedsAfe] = React.useState<boolean>(false)

    const { data: afeExistingAmount } = useSumPrWithAfe(afe ? afe.number : "")

    const afeFilter = createFilterOptions<AFE>({
        matchFrom: "any",
        stringify: (option) => option.number + option.unit.unitNumber + (option.unit.location ?? "")
    })

    const partsFilter = createFilterOptions<PartOption>({
        matchFrom: "any",
        limit: 500
    })

    React.useEffect(() => {
        if (!requester || !orderDate || !urgency || !orderType || (billable && !unit) || !(rows.length > 0) ||
            ((!unit && !truck && !so) && orderType !== "Shop Supplies")) {
            setDisableSubmit(true)
        } else {
            if (!rows[0].itemNumber) {
                setDisableSubmit(true)
            } else {
                setDisableSubmit(false)
            }
        }
    }, [requester, orderDate, billable, unit, afe, so, urgency, orderType, rows, truck])

    React.useEffect(() => {
        if (afe) {
            if (calcCost(rows as Array<OrderRow>) <= Number(afe.amount) - afeExistingAmount!) {
                setPrExceedsAfe(false)
            } else {
                setPrExceedsAfe(true)
            }
        }
    }, [afe, afeExistingAmount, rows])

    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault()

        const partsReq: CreatePartsReq = {
            requester: requester!,
            contact: undefined,
            date: orderDate,
            billable: billable,
            quoteOnly: quoteOnly,
            afe: afe ?? undefined,
            so: so ?? undefined,
            unit: unit ?? undefined,
            truck: truck ?? undefined,
            urgency: urgency ?? "",
            orderType: orderType ?? "",
            pickup: "",
            region: region ?? "",
            parts: rows,
            comments: comments,
            files: newFiles.map((file) => file.name),
            status: quoteOnly ? "Pending Quote" : "Pending Approval",
            amex: false,
            vendor: "",
            conex: conex,
            conexName: conexName ?? undefined,
            updated: new Date()
        }

        await createPartsReq({ partsReq }).then(async (res) => {
            for (let i = 0; i < newFiles.length; i++) {
                const formData = new FormData()
                formData.append("bucket", import.meta.env.VITE_BUCKET)
                formData.append("folder", "parts-req")
                formData.append("file", newFiles[i], `${res.files[i].id}.${res.files[i].name.split(".").pop()}`)

                await uploadFiles({ formData })
            }
        })

        window.location.href = ".."
    }

    const onQuoteChange = () => {
        setQuoteOnly(!quoteOnly)
    }

    const onBillableChange = () => {
        setBillable(!billable)

        if (billable && unit) {
            setSo(null)
        }
    }

    const onAfeChange = (_e: React.SyntheticEvent, value: AFE | null) => {
        setAfe(value ?? null)

        console.log(value)

        if (value) {
            const unit = unitNumbers ? unitNumbers.find(obj => obj.unitNumber === value.unit.unitNumber) : undefined
            onUnitNumberChange(undefined, unit ?? null)
            onTruckChange(undefined, null)
        } else {
            onUnitNumberChange(undefined, null)
        }
    }
    const onSoChange = (_e: React.SyntheticEvent, value: string | null) => {
        setSo(value ?? null)

        setOrderType(value ? billable ? "Rental" : "Third-Party" : null)
    }
    const onUnitNumberChange = (_e: React.SyntheticEvent | undefined, value: Unit | null) => {
        setUnit(value ?? null)

        if (!billable) {
            onSoChange(_e!, null)
        }

        setOrderType(value ? "Rental" : so ? "Third-Party" : null)
        setRegion(
            value ?
                SHOP_TITLES.includes(novaUser!.jobTitle) ?
                    novaUser!.region[0] :
                    value.operationalRegion ?
                        toTitleCase(value.operationalRegion) :
                        novaUser ?
                            novaUser.region[0] :
                            null :
                null
        )
    }
    const onTruckChange = (_e: React.SyntheticEvent | undefined, value: string | null) => {
        setTruck(value ?? null)
    }
    const onCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setComment(e.target.value)
    }

    const onCreateRow = () => {
        setRows([...rows, { qty: 1, itemNumber: "", description: "", cost: "", mode: "", received: 0 }])
    }

    function removeRow(index: number) {
        const tempRows = [...rows]
        tempRows.splice(index, 1)
        setRows(tempRows)
    }

    const onQtyChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const tempRows = [...rows]
        const row = { ...tempRows[index] }
        row.qty = Number(e.target.value)
        tempRows[index] = row
        setRows(tempRows)
    }

    const onPartChange = (index: number) => (_e: React.SyntheticEvent, value: PartOption | string | null) => {
        const tempRows = [...rows]
        const row = { ...tempRows[index] }

        if (typeof value === "string") {
            if (partExists(value)) {
                const part = getPart(value)
                row.itemNumber = part.itemNumber
                row.description = part.description
                row.cost = part.cost
                row.mode = part.mode
            } else {
                row.itemNumber = value
                row.description = ""
                row.cost = ""
                row.mode = ""
            }
        } else if (value && value.inputValue) {
            row.itemNumber = value.inputValue
            row.description = ""
            row.cost = ""
            row.mode = ""
        } else {
            row.itemNumber = value?.itemNumber ? value.itemNumber : ""
            row.description = value?.description ? value.description : ""
            row.cost = value?.cost ? value.cost : ""
            row.mode = value?.mode ? value.mode : ""
        }

        tempRows[index] = row
        setRows(tempRows)
    }

    const onDescriptionChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const tempRows = [...rows]
        const row = { ...tempRows[index] }
        row.description = e.target.value
        tempRows[index] = row
        setRows(tempRows)
    }

    const onCostChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const tempRows = [...rows]
        const row = { ...tempRows[index] }
        row.cost = e.target.value
        tempRows[index] = row
        setRows(tempRows)
    }

    const onConexChange = () => {
        if (conex) {
            setConex(false)
            setConexName(null)
        } else {
            setConex(true)
        }
    }

    const onConexNameChange = (_e: React.SyntheticEvent, value: string | null) => {
        setConexName(value)
    }

    const onAddComment = () => {
        setComments((comments) => [
            ...comments,
            {
                comment: comment,
                name: novaUser ? `${novaUser.firstName} ${novaUser.lastName}` : "",
                timestamp: new Date()
            }
        ])

        setComment("")
    }

    // Prevent enter key from submitting form
    const handleKeyDown = (e: { keyCode: number; preventDefault: () => void }) => {
        if (e.keyCode === 13) {
            e.preventDefault()
        }
    }

    function getPart(itemNumber: string): Part {
        const part = parts?.find((el) => el.itemNumber.toUpperCase() === itemNumber.toUpperCase())

        return part!
    }

    function partExists(itemNumber: string): boolean {
        const part = parts?.find((el) => el.itemNumber.toUpperCase() === itemNumber.toUpperCase())
        return part ? true : false
    }

    function partIsInventoryItem(itemNumber: string): boolean {
        const part = parts?.find((el) => el.itemNumber.toUpperCase() === itemNumber.toUpperCase())
        return part?.type === "inventoryitem"
    }

    if (isFetched) {
        return (
            <Box sx={{
                width: "100%", maxHeight: "calc(100% - 64px)", bgcolor: "background.paper", margin: "15px", padding: "10px", borderRadius: "0.5rem",
                overflow: "auto", border: "5px solid", borderColor: "background.paper"
            }}>
                <form
                    onSubmit={handleSubmit}
                    onKeyDown={handleKeyDown}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                >
                    <h2 style={{ margin: "5px" }}>New Parts Requisition</h2>
                    <Grid container spacing={2} sx={{ width: "100%" }}>
                        <Grid xs={12} sm={4}>
                            <Item>
                                <Box>
                                    <b><p style={{ margin: 0 }}>Complete All Applicable Fields:</p></b>
                                    <Divider />
                                    <StyledTextField
                                        variant="standard"
                                        label="Parts Requester"
                                        value={`${requester?.firstName} ${requester?.lastName}`}
                                        InputProps={{ readOnly: true }}
                                    />
                                    <div>
                                        <i>
                                            <Typography variant="caption">
                                                {requester?.jobTitle}
                                            </Typography>
                                        </i>
                                        {requester?.cellPhone && <i>
                                            <Typography variant="caption">
                                                {` | ${requester?.cellPhone}`}
                                            </Typography>
                                        </i>
                                        }
                                    </div>
                                    <StyledTextField
                                        variant="standard"
                                        label="Order Date"
                                        value={orderDate.toLocaleDateString()}
                                        InputProps={{ readOnly: true }}
                                        sx={{ marginBottom: "10px" }}
                                    />
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <Checkbox
                                            checked={quoteOnly}
                                            onChange={onQuoteChange}
                                            disableRipple
                                            sx={{ paddingLeft: 0 }}
                                        />
                                        <b><p style={{ margin: 0 }}>Quote Only?</p></b>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <Checkbox
                                            checked={billable}
                                            onChange={onBillableChange}
                                            disableRipple
                                            sx={{ paddingLeft: 0 }}
                                        />
                                        <b><p style={{ margin: 0 }}>Billable to Customer for Nova Unit?</p></b>
                                    </div>
                                    <b><p style={{ margin: "20px 0px 0px 0px" }}>Class:</p></b>
                                    <Divider />
                                    <Autocomplete
                                        options={afes ? afes : []}
                                        getOptionLabel={(option) => option.number}
                                        onChange={onAfeChange}
                                        loading={afeFetching}
                                        value={afe}
                                        renderInput={(params) => <StyledTextField
                                            {...params}
                                            variant="standard"
                                            label="AFE #"
                                        />}
                                        disabled={!!so}
                                        filterOptions={afeFilter}
                                        renderOption={(props, option, { inputValue }) => {
                                            // Get matches in AFE number
                                            const afeNumberMatches = match(option.number, inputValue, { insideWords: true })
                                            // Get parts from AFE number matches
                                            const afeNumberParts = parse(option.number, afeNumberMatches)

                                            // Get matches in unit number
                                            const unitNumberMatches = match(option.unit.unitNumber, inputValue, { insideWords: true })
                                            // Get parts from unit number matches
                                            const unitNumberParts = parse(option.unit.unitNumber, unitNumberMatches)

                                            // Get matches in location
                                            const locationMatches = match(option.unit.location ?? "", inputValue, { insideWords: true })
                                            // Get parts from location matches
                                            const locationParts = parse(option.unit.location ?? "", locationMatches)

                                            return (
                                                <li {...props} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                    <div style={{ width: "20%", marginRight: "5px" }}>
                                                        {afeNumberParts.map((part, index) => (
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
                                                    <div style={{ width: "30%" }}>
                                                        {unitNumberParts.map((part, index) => (
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
                                                    <div style={{ width: "100%" }}>
                                                        {locationParts.map((part, index) => (
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
                                            )
                                        }}
                                    />
                                    <Autocomplete
                                        options={soNumbers ? soNumbers : []}
                                        onChange={onSoChange}
                                        loading={soFetching}
                                        value={so}
                                        renderInput={(params) => <StyledTextField
                                            {...params}
                                            variant="standard"
                                            label="SO #"
                                        />}
                                        disabled={!!afe || (!billable && !!unit)}
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
                                    <b><p style={{ margin: "20px 0px 0px 0px" }}>Related Asset:</p></b>
                                    <Divider />
                                    <Autocomplete
                                        options={unitNumbers ? unitNumbers : []}
                                        getOptionLabel={(option: Unit) => option.unitNumber}
                                        onChange={onUnitNumberChange}
                                        loading={unitsFetching}
                                        value={unit}
                                        renderInput={(params) => <StyledTextField
                                            {...params}
                                            variant="standard"
                                            label="Unit #"
                                        />}
                                        disabled={!!truck || !!afe}
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
                                    <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                        <p style={{ marginTop: "10px", marginRight: "10px" }}>Location:</p>
                                        {unit ?
                                            <p style={{ marginTop: "10px" }}>{unit.location}</p> : null
                                        }
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                        <p style={{ marginTop: "5px", marginRight: "10px" }}>Customer:</p>
                                        {unit ?
                                            <p style={{ marginTop: "5px" }}>{unit.customer}</p> : null
                                        }
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                        <p style={{ marginTop: "5px", marginRight: "10px" }}>Status:</p>
                                        {unit ?
                                            <p style={{ marginTop: "5px" }}>{unit.status}</p> : null
                                        }
                                    </div>
                                    <b><p style={{ margin: "5px 0px 0px 0px" }}>OR:</p></b>
                                    <Autocomplete
                                        options={trucks ? trucks : []}
                                        onChange={onTruckChange}
                                        loading={trucksFetching}
                                        value={truck}
                                        renderInput={(params) => <StyledTextField
                                            {...params}
                                            variant="standard"
                                            label="Truck #"
                                        />}
                                        disabled={!!unit}
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
                                </Box>
                            </Item>
                        </Grid>
                        <Grid xs={12} sm={4}>
                            <Item sx={{ marginBottom: "10px" }}>
                                <b><p style={{ margin: 0 }}>Were all these parts taken from a Conex?</p></b>
                                <div
                                    style={{ display: "flex", flexDirection: "row", alignItems: "flex-end" }}
                                >
                                    <Checkbox
                                        checked={conex}
                                        onChange={onConexChange}
                                        disableRipple
                                    />
                                    <Autocomplete
                                        disabled={!conex}
                                        options={locations ? locations.filter((location) => location.includes("CONEX") || location.includes("STORAGE") ||
                                            location.includes("TRUCK")) : []}
                                        loading={locationsFetching}
                                        onChange={onConexNameChange}
                                        value={conexName}
                                        renderInput={(params) => <StyledTextField
                                            {...params}
                                            variant="standard"
                                            label="Conex"
                                        />}
                                        sx={{ width: "100%" }}
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
                                </div>
                            </Item>
                            <Item>
                                <Box>
                                    <b><p style={{ margin: 0 }}>Urgency:</p></b>
                                    <Divider />
                                    <FormControl>
                                        <RadioGroup row>
                                            {URGENCY.map((val) => {
                                                return (
                                                    <FormControlLabel
                                                        value={urgency}
                                                        onChange={() => setUrgency(val)}
                                                        control={<Radio disableRipple sx={{ paddingRight: "2px" }} checked={urgency === val} />}
                                                        label={val}
                                                        defaultChecked={false}
                                                        key={val}
                                                    />
                                                )
                                            })}
                                        </RadioGroup>
                                    </FormControl>
                                    <b><p style={{ margin: "20px 0px 0px 0px" }}>Order Type:</p></b>
                                    <Divider />
                                    <FormControl disabled={!!unit || !!so}>
                                        <RadioGroup row>
                                            {ORDER_TYPE.map((val) => {
                                                const canAccess = val.titles ? (val.titles.findIndex(el => novaUser!.jobTitle.includes(el)) !== -1) : true

                                                return canAccess ? (
                                                    <FormControlLabel
                                                        value={orderType}
                                                        onChange={() => setOrderType(val.type)}
                                                        control={<Radio disableRipple sx={{ paddingRight: "2px" }} checked={orderType === val.type} />}
                                                        label={val.type}
                                                        defaultChecked={false}
                                                        key={val.type}
                                                    />
                                                ) : null
                                            })}
                                        </RadioGroup>
                                    </FormControl>
                                    <b><p style={{ margin: "20px 0px 0px 0px" }}>Operational Region:</p></b>
                                    <Divider />
                                    <FormControl disabled={!!unit || (!!unit && SHOP_TITLES.includes(novaUser!.jobTitle))}>
                                        <RadioGroup row>
                                            {REGION.map((val) => {
                                                return (
                                                    <FormControlLabel
                                                        value={region}
                                                        onChange={() => setRegion(val)}
                                                        control={<Radio disableRipple sx={{ paddingRight: "2px" }} checked={region === val} />}
                                                        label={val}
                                                        defaultChecked={false}
                                                        key={val}
                                                    />
                                                )
                                            })}
                                        </RadioGroup>
                                    </FormControl>
                                </Box>
                            </Item>
                            <Item sx={{
                                marginTop: "15px", border: unit ? opsVpApprovalRequired(unit, rows as Array<OrderRow>) ?
                                    "3px solid red" :
                                    "3px solid transparent" :
                                    "3px solid transparent"
                            }} >
                                <Box>
                                    <b><p style={{ margin: 0 }}>Unit Planning Approval Status:</p></b>
                                    <Divider />
                                    {unit ?
                                        opsVpApprovalRequired(unit, rows as Array<OrderRow>) ?
                                            <b><p style={{ marginTop: "5px", color: "red" }}>Travis Yount Must Approve Non-PM Parts</p></b> :
                                            <p style={{ marginTop: "5px" }}>No Additional Approval Needed</p> :
                                        <p style={{ marginTop: "5px" }}>No Additional Approval Needed</p>
                                    }
                                    <b><p style={{ margin: "20px 0px 0px 0px" }}>Engine:</p></b>
                                    <Divider />
                                    <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                        <p style={{ marginTop: "5px", marginRight: "10px" }}>Make & Model:</p>
                                        {unit ?
                                            <p style={{ marginTop: "5px" }}>{unit.engine}</p> : null
                                        }
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                        <p style={{ marginRight: "10px", marginTop: 0 }}>S/N:</p>
                                        {unit ?
                                            <p style={{ margin: 0 }}>{unit.engineSerialNum}</p> : null
                                        }
                                    </div>
                                    <b><p style={{ margin: "10px 0px 0px 0px" }}>Compressor Frame:</p></b>
                                    <Divider />
                                    <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                        <p style={{ marginTop: "5px", marginRight: "10px" }}>Make:</p>
                                        {unit ?
                                            <p style={{ marginTop: "5px" }}>{unit.compressorFrame}</p> : null
                                        }
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                        <p style={{ marginRight: "10px", marginTop: 0 }}>Model:</p>
                                        {unit ?
                                            <p style={{ margin: 0 }}>{unit.compressorFrameFamily}</p> : null
                                        }
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                        <p style={{ marginRight: "10px", marginTop: 0 }}>S/N:</p>
                                        {unit ?
                                            <p style={{ margin: 0 }}>{unit.compressorFrameSN}</p> : null
                                        }
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                        <p style={{ marginRight: "10px", marginTop: 0 }}>Stages:</p>
                                        {unit ?
                                            <p style={{ margin: 0 }}>{unit.stages}</p> : null
                                        }
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                        <p style={{ marginRight: "10px", marginTop: 0, marginBottom: 0 }}>Cylinder Size:</p>
                                        {unit ?
                                            <p style={{ margin: 0 }}>{unit.cylinderSize}</p> : null
                                        }
                                    </div>
                                </Box>
                            </Item>
                        </Grid>
                        <Grid xs={12} sm={4}>
                            <Item sx={{
                                marginBottom: "10px", border: prExceedsAfe ? "3px solid red" : "3px solid transparent"
                            }}>
                                <p style={{ margin: 0 }}><b>Estimated Total Cost: </b>${calcCost(rows as Array<OrderRow>).toFixed(2)}</p>
                                {prExceedsAfe &&
                                    <b><p style={{ margin: "5px 0px 0px", color: "red" }}>Estimated Cost Exceeds Available AFE Amount</p></b>
                                }
                            </Item>
                            <Item style={{ overflow: "auto" }}>
                                <b><p style={{ margin: 0 }}>Comments:</p></b>
                                <Divider />
                                <div style={{ display: "flex", alignItems: "flex-end", padding: "5px" }}>
                                    <StyledTextField
                                        multiline
                                        variant="standard"
                                        label="New Comment"
                                        value={comment}
                                        onChange={onCommentChange}
                                    />
                                    <IconButton
                                        onClick={onAddComment}
                                        disabled={!comment}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </div>
                                <Box
                                    style={{ maxHeight: "250px", overflow: "auto", padding: "5px" }}
                                >
                                    {comments.sort((x, y) => { return x.timestamp < y.timestamp ? 1 : -1 }) // Sort comments chronologically
                                        .map((comment: Omit<Comment, "id">, index: number) => {
                                            return (
                                                <Box
                                                    key={index}
                                                    sx={{ padding: "5px", marginBottom: "5px", borderRadius: "0.25rem", backgroundColor: "background.paper" }}
                                                >
                                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                                        <p style={{ margin: "0px" }}>{comment.comment}</p>
                                                        <i style={{ color: "#838385" }}>
                                                            {comment.name} - {comment.timestamp.toLocaleDateString()} {comment.timestamp.toLocaleTimeString()}
                                                        </i>
                                                    </div>
                                                </Box>
                                            )
                                        })}
                                </Box>
                            </Item>
                            <Item
                                sx={{ marginTop: "15px" }}
                            >
                                <b><p style={{ margin: 0 }}>Documents:</p></b>
                                <Divider
                                    sx={{ marginBottom: "10px" }}
                                />
                                <AddFileButton
                                    setNewFiles={setNewFiles}
                                    disabled={false}
                                />
                                <Box
                                    sx={{ maxHeight: "250px", overflow: "auto" }}
                                >
                                    <Files
                                        files={[]}
                                        newFiles={newFiles}
                                        setNewFiles={setNewFiles}
                                        deleteFiles={deleteFiles}
                                        setDeleteFiles={setDeleteFiles}
                                        folder={"parts-req"}
                                        disabled={false}
                                    />
                                </Box>
                            </Item>
                        </Grid>
                        <Grid xs={12}>
                            <Item>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell width={"7%"}>Qty Needed</TableCell>
                                            <TableCell width={"25%"}>Part #</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell width={"90px"}>Rate</TableCell>
                                            <TableCell width={"5%"}>Amount</TableCell>
                                            <TableCell width={"3%"}></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map((row, index) => {
                                            return (
                                                <TableRow
                                                    key={index}
                                                >
                                                    <TableCell>
                                                        <StyledTextField
                                                            type="number"
                                                            variant="standard"
                                                            value={row.qty}
                                                            onChange={onQtyChange(index)}
                                                            InputProps={{
                                                                inputProps: { min: 1 }
                                                            }}
                                                            sx={{ width: "100%" }}
                                                            helperText={!rows[index].itemNumber && " "}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Autocomplete
                                                            options={parts ? parts as Array<PartOption> : []}
                                                            freeSolo
                                                            clearOnBlur
                                                            selectOnFocus
                                                            getOptionLabel={(option) => {
                                                                if (typeof option === "string") {
                                                                    return option
                                                                }
                                                                if (option.inputValue) {
                                                                    return option.inputValue
                                                                }
                                                                return `${option.itemNumber}` + (option.description ?
                                                                    ` - ${option.description}` :
                                                                    "")
                                                            }}
                                                            value={rows[index].itemNumber}
                                                            onChange={onPartChange(index)}
                                                            loading={partsFetching}
                                                            filterOptions={(options, params) => {
                                                                const filtered = partsFilter(options, params)

                                                                const { inputValue } = params
                                                                // Suggest creation of new value if nothing exists
                                                                const isItemNumberExisting = options.some((option) =>
                                                                    inputValue.toUpperCase() === option.itemNumber.toUpperCase()
                                                                )
                                                                const isDescriptionExisting = options.some((option) =>
                                                                    inputValue.toUpperCase() === option.description.toUpperCase()
                                                                )

                                                                const isExisting = isItemNumberExisting || isDescriptionExisting

                                                                if (inputValue !== "" && !isExisting) {
                                                                    filtered.push({
                                                                        inputValue,
                                                                        itemNumber: `Add "${inputValue}"`,
                                                                        id: inputValue,
                                                                        description: "",
                                                                        cost: "",
                                                                        mode: "",
                                                                        type: ""
                                                                    })
                                                                }

                                                                return filtered
                                                            }}
                                                            renderInput={(params) => <StyledTextField
                                                                {...params}
                                                                variant="standard"
                                                                error={!rows[index].itemNumber}
                                                                helperText={rows[index].itemNumber ? "" : "Press 'Enter' to save custom part"}
                                                            />}
                                                            renderOption={(props, option, { inputValue }) => {
                                                                // Get matches in item number
                                                                const itemNumberMatches = match(option.itemNumber, inputValue, { insideWords: true, requireMatchAll: true })
                                                                // Get parts from item number matches
                                                                const itemNumberParts = parse(option.itemNumber, itemNumberMatches)

                                                                // Get matches in description
                                                                const descriptionMatches = match(option.description, inputValue, { insideWords: true, requireMatchAll: true })
                                                                // Get parts from description matches
                                                                const descriptionParts = parse(option.description, descriptionMatches)

                                                                return (
                                                                    <li {...props} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                                        <div style={{ width: "30%", marginRight: "5px" }}>
                                                                            {itemNumberParts.map((part, index) => (
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
                                                                        <div style={{ width: "100%" }}>
                                                                            {descriptionParts.map((part, index) => (
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
                                                                        <span style={{ width: "15%", display: "flex", justifyContent: "flex-end" }}>
                                                                            {option.cost ? `$${option.cost}` : ""}
                                                                        </span>
                                                                    </li>
                                                                )
                                                            }}
                                                            PopperComponent={CustomPopper}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <StyledTextField
                                                            variant="standard"
                                                            value={row.description}
                                                            onChange={onDescriptionChange(index)}
                                                            helperText={!rows[index].itemNumber && " "}
                                                            disabled={partExists(rows[index].itemNumber) && partIsInventoryItem(rows[index].itemNumber)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <StyledTextField
                                                            variant="standard"
                                                            type="number"
                                                            value={row.cost}
                                                            onChange={onCostChange(index)}
                                                            InputProps={{
                                                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                                inputProps: {
                                                                    step: "0.01",
                                                                    min: 0
                                                                }
                                                            }}
                                                            helperText={!rows[index].itemNumber && " "}
                                                            disabled={partExists(rows[index].itemNumber)}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ paddingBottom: 0 }}>{row.cost ? `$${(Number(row.cost) * row.qty).toFixed(2)}` : ""}</TableCell>
                                                    <TableCell>
                                                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
                                                            {unit && opsVpApprovalRequired(unit, rows as Array<OrderRow>) && rows[index].mode !== "PM PARTS" ?
                                                                <Tooltip
                                                                    title={"Non-PM Part"}
                                                                    componentsProps={{
                                                                        tooltip: {
                                                                            sx: {
                                                                                border: "1px solid white",
                                                                                bgcolor: "background.paper"
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    <ErrorOutlineIcon
                                                                        sx={{ color: "red" }}
                                                                    />
                                                                </Tooltip> : null
                                                            }
                                                            <IconButton
                                                                onClick={() => removeRow(index)}
                                                                disableRipple
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                        <TableRow>
                                            <TableCell sx={{ border: "none" }} />
                                            <TableCell sx={{ border: "none" }} />
                                            <TableCell sx={{ border: "none" }} />
                                            <TableCell sx={{ border: "none" }} />
                                            <TableCell sx={{ border: "none" }}><b>${calcCost(rows as Array<OrderRow>).toFixed(2)}</b></TableCell>
                                            <TableCell sx={{ border: "none" }} />
                                        </TableRow>
                                    </TableBody>
                                </Table>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={onCreateRow}
                                    sx={{
                                        backgroundColor: theme.palette.primary.dark,
                                        "&.MuiButton-root:hover": {
                                            backgroundColor: theme.palette.primary.dark
                                        }
                                    }}
                                >
                                    Add Item
                                </Button>
                            </Item>
                        </Grid>
                    </Grid>
                    <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", padding: "15px 15px 0px 0px" }}>
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={disableSubmit}
                            sx={{
                                backgroundColor: theme.palette.primary.dark,
                                "&.MuiButton-root:hover": {
                                    backgroundColor: theme.palette.primary.dark
                                }
                            }}
                        >
                            Submit
                        </Button>
                    </div>
                </form>
            </Box >
        )
    } else {
        return <Loader />
    }
}