import * as React from "react"

import { useAuth0 } from "@auth0/auth0-react"
import { useAFEs } from "../../hooks/afe"
import { useSOs } from "../../hooks/so"
import { useUnits } from "../../hooks/unit"
import { useTrucks } from "../../hooks/truck"
import { useParts } from "../../hooks/parts"
import { useCreatePartsReq } from "../../hooks/partsReq"
import { useNovaUser } from "../../hooks/user"

import { toTitleCase } from "../../utils/helperFunctions"
import { calcCost } from "../../utils/helperFunctions"

import { OrderRow, CreatePartsReq, Part, Comment } from "../../types/partsReq"
import { Unit } from "../../types/unit"

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
import Loader from "../common/Loader"
import InputAdornment from '@mui/material/InputAdornment'

const URGENCY = ["Unit Down", "Rush", "Standard"]
const ORDER_TYPE = [{ type: "Rental" }, { type: "Third-Party" }, { type: "Shop Supplies" }, { type: "Truck Supplies" }, { type: "Stock", titles: ["Supply Chain", "Software"] }]
const REGION = ["East Texas", "South Texas", "Midcon", "North Permian", "South Permian", "Pecos", "Carlsbad"]

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "#242424",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "left",
    color: "white"
}))

export default function PartsReqForm() {
    const { user } = useAuth0()

    const { data: novaUser, isFetched } = useNovaUser(undefined, user?.email)

    const { data: afeNumbers, isFetching: afeFetching } = useAFEs()
    const { data: soNumbers, isFetching: soFetching } = useSOs()
    const { data: unitNumbers, isFetching: unitsFetching } = useUnits()
    const { data: trucks, isFetching: trucksFetching } = useTrucks()
    const { data: parts, isFetching: partsFetching } = useParts()

    const { mutateAsync: createPartsReq } = useCreatePartsReq()

    const [requester] = React.useState<string | undefined>(`${novaUser?.firstName} ${novaUser?.lastName}`)
    const [orderDate] = React.useState<Date>(new Date())
    const [afe, setAfe] = React.useState<string | null>(null)
    const [so, setSo] = React.useState<string | null>(null)
    const [unit, setUnit] = React.useState<Unit | null>(null)
    const [truck, setTruck] = React.useState<string | null>(null)
    const [urgency, setUrgency] = React.useState<string | null>(null)
    const [orderType, setOrderType] = React.useState<string | null>(null)
    const [region, setRegion] = React.useState<string | null>(null)
    const [rows, setRows] = React.useState<Array<Omit<OrderRow, "id">>>([])
    const [comment, setComment] = React.useState<string>("")
    const [comments, setComments] = React.useState<Array<Omit<Comment, "id">>>([])
    const [disableSubmit, setDisableSubmit] = React.useState<boolean>(true)

    React.useEffect(() => {
        if (!requester || !orderDate || (!afe && !so) || (!unit && !truck) ||
            !urgency || !orderType || !(rows.length > 0)) {
            setDisableSubmit(true)
        } else {
            if (!rows[0].itemNumber) {
                setDisableSubmit(true)
            } else {
                setDisableSubmit(false)
            }
        }
    }, [requester, orderDate, afe, so, unit, truck, urgency, orderType, rows])

    const handleSubmit = (event: React.SyntheticEvent) => {
        event.preventDefault()

        const formData: CreatePartsReq = {
            requester: requester ? requester : "",
            contact: "",
            date: orderDate,
            afe: afe,
            so: so,
            unit: unit,
            truck: truck,
            urgency: urgency,
            orderType: orderType,
            region: region,
            parts: rows,
            comments: comments,
            status: "Pending Approval",
            updated: new Date()
        }

        createPartsReq(formData)

        window.location.href = ".."
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

    const onCreateRow = () => {
        setRows([...rows, { qty: 1, itemNumber: "", description: "", cost: "" }])
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

    const onPartChange = (index: number) => (_e: React.SyntheticEvent, value: Part | null) => {
        const tempRows = [...rows]
        const row = { ...tempRows[index] }
        row.itemNumber = value ? value.values.itemid : ""
        row.description = value ? value.values.salesdescription : null
        row.cost = value ? value.values.cost : null
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

    if (isFetched) {
        return (
            <Box sx={{
                width: "100%", maxHeight: "calc(100% - 64px)", bgcolor: "background.paper", margin: "15px", padding: "10px", borderRadius: "0.5rem",
                overflow: "auto", border: "5px solid", borderColor: "background.paper"
            }}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <h2 style={{ margin: "5px" }}>New Parts Requisition</h2>
                    <Grid container spacing={2} sx={{ width: "100%" }}>
                        <Grid xs={3}>
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
                                    <StyledTextField
                                        variant="standard"
                                        label="Order Date"
                                        value={orderDate.toLocaleDateString()}
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
                                        disabled={truck !== null}
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
                                    />
                                </Box>
                            </Item>
                        </Grid>
                        <Grid xs={6}>
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
                        <Grid xs={3}>
                            <Item style={{ maxHeight: "600px", overflow: "auto" }}>
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
                                    style={{ maxHeight: "500px", overflow: "auto", padding: "5px" }}
                                >
                                    {comments.sort((x, y) => { return x.timestamp < y.timestamp ? 1 : -1 }) // Sort comments chronologically
                                        .map((comment: Omit<Comment, "id">, index: number) => {
                                            return (
                                                <Box
                                                    key={index}
                                                    sx={{ padding: "5px", marginBottom: "5px", borderRadius: "0.25rem", backgroundColor: "background.paper" }}
                                                >
                                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                                        <p>{comment.comment}</p>
                                                        <i style={{ color: "#838385" }}>{comment.name} - {comment.timestamp.toLocaleDateString()} {comment.timestamp.toLocaleTimeString()}</i>
                                                    </div>
                                                </Box>
                                            )
                                        })}
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
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Autocomplete
                                                            options={parts ? parts : []}
                                                            getOptionLabel={(option: Part) => `${option.values.itemid}` + (option.values.salesdescription ?
                                                                ` - ${option.values.salesdescription}` :
                                                                "")}

                                                            onChange={onPartChange(index)}
                                                            loading={partsFetching}
                                                            filterOptions={createFilterOptions({
                                                                matchFrom: "any",
                                                                limit: 500
                                                            })}
                                                            renderInput={(params) => <StyledTextField
                                                                {...params}
                                                                variant="standard"
                                                            />}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{row.description}</TableCell>
                                                    <TableCell>
                                                        <StyledTextField
                                                            variant="standard"
                                                            type="number"
                                                            value={row.cost}
                                                            onChange={onCostChange(index)}
                                                            inputProps={{
                                                                step: "0.01"
                                                            }}
                                                            InputProps={{
                                                                startAdornment: <InputAdornment position="start">$</InputAdornment>
                                                            }}
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
                                        <TableRow>
                                            <TableCell sx={{ border: "none" }} />
                                            <TableCell sx={{ border: "none" }} />
                                            <TableCell sx={{ border: "none" }} />
                                            <TableCell sx={{ border: "none" }} />
                                            <TableCell sx={{ border: "none" }}><b>{calcCost(rows as Array<OrderRow>)}</b></TableCell>
                                            <TableCell sx={{ border: "none" }} />
                                        </TableRow>
                                    </TableBody>
                                </Table>
                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={onCreateRow}
                                    sx={{ marginTop: "5px" }}
                                >
                                    Add Item
                                </Button>
                            </Item>
                        </Grid>
                    </Grid>
                    <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", padding: "15px 15px 0px 0px" }}>
                        <Button
                            variant="outlined"
                            type="submit"
                            disabled={disableSubmit}
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