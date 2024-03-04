import * as React from "react"

import { useAuth0 } from "@auth0/auth0-react"
import { useAFEs } from "../../hooks/afe"
import { useSOs } from "../../hooks/so"
import { useUnits } from "../../hooks/unit"
import { useTrucks } from "../../hooks/truck"
import { useParts } from "../../hooks/parts"
import { useWarehouses } from "../../hooks/warehouse"
import { useNovaUser } from "../../hooks/user"
import { useUpdatePartsReq } from "../../hooks/partsReq"
import { useUploadFiles } from "../../hooks/storage"

import { toTitleCase } from "../../utils/helperFunctions"
import { calcCost } from "../../utils/helperFunctions"

import { OrderRow, PartsReq, UpdatePartsReq } from "../../types/partsReq"
import { Unit } from "../../types/unit"
import { Part } from "../../types/part"
import { Comment } from "../../types/comment"

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
import { UNIT_PLANNING } from "../../utils/unitPlanning"
import InputAdornment from '@mui/material/InputAdornment'
import parse from 'autosuggest-highlight/parse'
import match from 'autosuggest-highlight/match'
import theme from "../../css/theme"
import Popper, { PopperProps } from '@mui/material/Popper'
import Files from "./Files"
import AddFileButton from "./AddFileButton"
import { File as IFile } from "../../types/file"
import Skeleton from '@mui/material/Skeleton'

const URGENCY = ["Unit Down", "Rush", "Standard"]
const ORDER_TYPE = [{ type: "Rental" }, { type: "Third-Party" }, { type: "Shop Supplies" }, { type: "Truck Supplies" }, { type: "Stock", titles: ["Supply Chain", "Software"] }]
const REGION = ["East Texas", "South Texas", "Midcon", "North Permian", "South Permian", "Pecos", "Carlsbad"]
const STATUS = ["Rejected - Adjustments Required", "Approved", "Sourcing - Information Required", "Ordered - Awaiting Parts",
    "Completed - Parts Staged/Delivered", "Closed - Parts in Hand"]

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

interface Props {
    partsReq: PartsReq,
    setActivePartsReq: React.Dispatch<React.SetStateAction<PartsReq | null>>
}

interface PartOption extends Part {
    inputValue?: string
}

export default function EditPartsReqForm(props: Props) {
    const { partsReq, setActivePartsReq } = props

    const { user } = useAuth0()

    const { data: novaUser, isFetched } = useNovaUser(undefined, user?.email)

    const { data: afeNumbers, isFetching: afeFetching } = useAFEs()
    const { data: soNumbers, isFetching: soFetching } = useSOs()
    const { data: unitNumbers, isFetching: unitsFetching } = useUnits()
    const { data: trucks, isFetching: trucksFetching } = useTrucks()
    const { data: parts, isFetching: partsFetching } = useParts()
    const { data: warehouses, isFetching: warehousesFetching } = useWarehouses()

    const { mutateAsync: updatePartsReq } = useUpdatePartsReq()
    const { mutateAsync: uploadFiles } = useUploadFiles()

    const [status, setStatus] = React.useState<string>(partsReq.status)
    const [requester] = React.useState<string>(partsReq.requester)
    const [contact, setContact] = React.useState<string>(partsReq.contact)
    const [orderDate] = React.useState<Date>(partsReq.date)
    const [afe, setAfe] = React.useState<string | null>(partsReq.afe)
    const [so, setSo] = React.useState<string | null>(partsReq.so)
    const [unit, setUnit] = React.useState<Unit | null>(partsReq.unit)
    const [truck, setTruck] = React.useState<string | null>(partsReq.truck)
    const [urgency, setUrgency] = React.useState<string | null>(partsReq.urgency)
    const [orderType, setOrderType] = React.useState<string | null>(partsReq.orderType)
    const [pickup, setPickup] = React.useState<string>(partsReq.pickup)
    const [region, setRegion] = React.useState<string | null>(partsReq.region)
    const [rows, setRows] = React.useState<Array<Omit<OrderRow, "id">>>(partsReq.parts)
    const [delRows, setDelRows] = React.useState<Array<OrderRow>>([])
    const [comment, setComment] = React.useState<string>("")
    const [comments, setComments] = React.useState<Array<Omit<Comment, "id">>>(partsReq.comments)
    const [files] = React.useState<Array<IFile>>(partsReq.files)
    const [newFiles, setNewFiles] = React.useState<Array<File>>([])
    const [deleteFiles, setDeleteFiles] = React.useState<Array<string>>([])
    const [disabled, setDisabled] = React.useState<boolean>(false)

    const partsFilter = createFilterOptions<PartOption>({
        matchFrom: "any",
        limit: 500
    })

    React.useEffect(() => {
        if (!requester || !orderDate || (!unit && !truck) ||
            !urgency || !orderType || !(rows.length > 0)) {
            setDisabled(true)
        } else {
            if (!rows[0].itemNumber) {
                setDisabled(true)
            } else {
                setDisabled(false)
            }
        }
    }, [requester, orderDate, afe, so, unit, truck, urgency, orderType, rows, setDisabled])

    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault()

        const updateReq = {
            user: `${novaUser?.firstName} ${novaUser?.lastName}`,
            updateReq: {
                id: partsReq.id,
                contact: contact,
                afe: afe,
                so: so,
                unit: unit,
                truck: truck,
                urgency: urgency,
                orderType: orderType,
                pickup: pickup,
                region: region,
                parts: rows as Array<OrderRow>,
                comments: comments as Array<Comment>,
                newFiles: newFiles.map((file) => file.name),
                delFiles: deleteFiles,
                status: status,
                delRows: delRows
            } as UpdatePartsReq
        }

        await updatePartsReq(updateReq).then(async (res) => {
            for (let i = 0; i < newFiles.length; i++) {
                const formData = new FormData()
                formData.append("bucket", import.meta.env.VITE_BUCKET)
                formData.append("folder", "parts-req")
                formData.append("file", newFiles[i], `${res.files[i].id}.${res.files[i].name.split(".").pop()}`)

                await uploadFiles({ formData })
            }
        })

        setActivePartsReq(null)
    }

    const onStatusChange = (_e: React.SyntheticEvent, value: string | null) => {
        setStatus(value ?? "")

        if (["Sourcing - Information Required", "Ordered - Awaiting Parts", "Completed - Parts Staged/Delivered", "Closed - Parts in Hand"].includes(value ?? "")) {
            setContact(`${novaUser?.firstName} ${novaUser?.lastName}`)
        } else {
            setContact("")
        }
    }

    const onAfeChange = (_e: React.SyntheticEvent, value: string | null) => {
        setAfe(value ?? null)
    }
    const onSoChange = (_e: React.SyntheticEvent, value: string | null) => {
        setSo(value ?? null)

        setOrderType(value ? "Third-Party" : null)
    }
    const onUnitNumberChange = (_e: React.SyntheticEvent, value: Unit | null) => {
        setUnit(value ?? null)

        onSoChange(_e, null)

        setOrderType(value ? "Rental" : null)
        setRegion(value ? value.operationalRegion ? toTitleCase(value.operationalRegion) : null : null)
    }
    const onTruckChange = (_e: React.SyntheticEvent, value: string | null) => {
        setTruck(value ?? null)
    }
    const onCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setComment(e.target.value)
    }
    const onPickupChange = (_e: React.SyntheticEvent, value: string | null) => {
        setPickup(value ?? "")
    }

    const onCreateRow = () => {
        setRows([...rows, { qty: 1, itemNumber: "", description: "", cost: "" }])
    }

    function removeRow(index: number) {
        const tempRows = [...rows]
        tempRows.splice(index, 1)
        setRows(tempRows)

        if ((rows[index] as OrderRow).id) {
            setDelRows([...delRows, rows[index] as OrderRow])
        }
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
            } else {
                row.itemNumber = value
                row.description = ""
                row.cost = ""
            }
        } else if (value && value.inputValue) {
            row.itemNumber = value.inputValue
            row.description = ""
            row.cost = ""
        } else {
            row.itemNumber = value?.itemNumber ? value.itemNumber : ""
            row.description = value?.description ? value.description : ""
            row.cost = value?.cost ? value.cost : ""
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

    if (isFetched) {
        return (
            <Box sx={{
                bgcolor: "background.paper", margin: "15px", padding: "10px", borderRadius: "0.5rem",
                overflow: "auto", border: "5px solid", borderColor: "background.paper"
            }}>
                <form
                    onSubmit={handleSubmit}
                    onKeyDown={handleKeyDown}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                >
                    <Grid container spacing={2} sx={{ width: "100%" }}>
                        <Grid xs={12} sm={4}>
                            <Item sx={{ marginBottom: "15px" }}>
                                <Box>
                                    <Autocomplete
                                        options={STATUS}
                                        onChange={onStatusChange}
                                        value={status}
                                        disableClearable
                                        renderInput={(params) => <StyledTextField
                                            {...params}
                                            variant="standard"
                                            label="Status"
                                        />}
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
                            <Item>
                                <Box>
                                    <b><p style={{ margin: 0 }}>Complete All Applicable Fields:</p></b>
                                    <Divider />
                                    <StyledTextField
                                        variant="standard"
                                        label="Parts Requester"
                                        defaultValue={requester}
                                        InputProps={{ readOnly: true }}
                                    />
                                    {contact &&
                                        <StyledTextField
                                            variant="standard"
                                            label="Supply Chain Contact"
                                            defaultValue={contact}
                                            InputProps={{ readOnly: true }}
                                        />
                                    }
                                    <StyledTextField
                                        variant="standard"
                                        label="Order Date"
                                        value={new Date(orderDate).toLocaleDateString()}
                                        InputProps={{ readOnly: true }}
                                    />
                                    <b><p style={{ margin: "20px 0px 0px 0px" }}>Class:</p></b>
                                    <Divider />
                                    <Autocomplete
                                        options={afeNumbers ? afeNumbers : []}
                                        onChange={onAfeChange}
                                        loading={afeFetching}
                                        value={afe}
                                        renderInput={(params) => <StyledTextField
                                            {...params}
                                            variant="standard"
                                            label="AFE #"
                                        />}
                                        disabled={so !== null}
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
                                        disabled={afe !== null || unit !== null}
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
                                        isOptionEqualToValue={(option, value) => option.unitNumber === value.unitNumber}
                                        renderInput={(params) => <StyledTextField
                                            {...params}
                                            variant="standard"
                                            label="Unit #"
                                        />}
                                        disabled={truck !== null}
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
                                        disabled={unit !== null}
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
                            {(status === "Completed - Parts Staged/Delivered" || status === "Closed - Parts in Hand") &&
                                <Item sx={{ marginBottom: "15px" }}>
                                    <Box>
                                        <Autocomplete
                                            options={warehouses ? warehouses.concat("WILL CALL") : []}
                                            loading={warehousesFetching}
                                            onChange={onPickupChange}
                                            value={pickup}
                                            disableClearable
                                            renderInput={(params) => <StyledTextField
                                                {...params}
                                                variant="standard"
                                                label="Pick Up Location"
                                            />}
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
                            }
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
                                    <FormControl disabled={unit !== null || so !== null}>
                                        <RadioGroup row>
                                            {ORDER_TYPE.map((val) => {
                                                const canAccess = val.titles ? (val.titles.findIndex(el => novaUser!.title.includes(el)) !== -1) : true

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
                                    <FormControl disabled={unit !== null}>
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
                                marginTop: "15px", border: unit ? UNIT_PLANNING.includes(unit.unitNumber) ?
                                    "3px solid red" :
                                    "3px solid transparent" :
                                    "3px solid transparent"
                            }} >
                                <Box>
                                    <b><p style={{ margin: 0 }}>Unit Planning Approval Status:</p></b>
                                    <Divider />
                                    {unit ?
                                        UNIT_PLANNING.includes(unit.unitNumber) ?
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
                            <Item sx={{ marginBottom: "10px" }}>
                                <p style={{ margin: 0 }}><b>Estimated Total Cost: </b>{calcCost(rows as Array<OrderRow>)}</p>
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
                                    style={{ maxHeight: "250px", overflow: "auto", padding: "5px 0px 0px 0px" }}
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
                                                        <i style={{ color: "#838385" }}>{comment.name} - {new Date(comment.timestamp).toLocaleDateString()} {new Date(comment.timestamp).toLocaleTimeString()}</i>
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
                                />
                                <Box
                                    sx={{ maxHeight: "250px", overflow: "auto" }}
                                >
                                    <Files
                                        newFiles={newFiles}
                                        setNewFiles={setNewFiles}
                                        files={files}
                                        deleteFiles={deleteFiles}
                                        setDeleteFiles={setDeleteFiles}
                                        folder={"parts-req"}
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
                                            return partsFetching ? (
                                                <TableRow
                                                    key={index}
                                                >
                                                    <TableCell>
                                                        <Skeleton
                                                            animation={"wave"}
                                                            sx={{ width: "100%" }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton
                                                            animation={"wave"}
                                                            sx={{ width: "100%" }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton
                                                            animation={"wave"}
                                                            sx={{ width: "100%" }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton
                                                            animation={"wave"}
                                                            sx={{ width: "100%" }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton
                                                            animation={"wave"}
                                                            sx={{ width: "100%" }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
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
                                                                        cost: ""
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
                                                            disabled={partExists(rows[index].itemNumber)}
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
                                                    <TableCell>{row.cost ? `$${(Number(row.cost) * row.qty).toFixed(2)}` : ""}</TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            onClick={() => removeRow(index)}
                                                            disableRipple
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                        {partsFetching ? null :
                                            <TableRow>
                                                <TableCell sx={{ border: "none" }} />
                                                <TableCell sx={{ border: "none" }} />
                                                <TableCell sx={{ border: "none" }} />
                                                <TableCell sx={{ border: "none" }} />
                                                <TableCell sx={{ border: "none" }}><b>{calcCost(rows as Array<OrderRow>)}</b></TableCell>
                                                <TableCell sx={{ border: "none" }} />
                                            </TableRow>
                                        }
                                    </TableBody>
                                </Table>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={onCreateRow}
                                    disabled={partsFetching}
                                    sx={{
                                        marginTop: "5px", backgroundColor: theme.palette.primary.dark,
                                        "&.MuiButton-root:hover": { backgroundColor: "#334787" }
                                    }}
                                >
                                    Add Item
                                </Button>
                            </Item>
                        </Grid>
                    </Grid>
                    <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", padding: "15px 15px 0px 0px" }}>
                        <Button
                            onClick={() => { setActivePartsReq(null) }}
                            variant="outlined"
                            color="error"
                            sx={{ marginRight: "10px", "&.MuiButton-root:hover": { backgroundColor: "#334787" } }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outlined"
                            type="submit"
                            disabled={disabled}
                            sx={{ "&.MuiButton-root:hover": { backgroundColor: "#334787" } }}
                        >
                            Save
                        </Button>
                    </div>
                </form>
            </Box >
        )
    }
}