import * as React from "react"

import { useAuth0 } from "@auth0/auth0-react"
import useFetch from "../../hooks/useFetch"

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
import { Unit } from "../../types/types"
import { UNIT_PLANNING } from "../../utils/unitPlanning"

interface ReqClass {
    afe: string,
    so: string
}
interface RelAsset {
    unit: Unit | null,
    truck: string
}
interface Part {
    recordType: string,
    id: string,
    values: {
        itemid: string,
        salesdescription: string | null,
        cost: string
    }
}
interface OrderRow {
    qty: number,
    itemNumber: string,
    description: string | null
}

const URGENCY = ["Unit Down", "Rush", "Standard"]
const ORDER_TYPE = ["Rental", "Third-Party", "Shop Supplies", "Truck Supplies"]
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

    const { data: afeNumbers, loading: afeLoading } = useFetch<Array<string>>(`${import.meta.env.VITE_API_BASE}/kpa/afe`)
    const { data: soNumbers, loading: soLoading } = useFetch<Array<string>>(`${import.meta.env.VITE_API_BASE}/netsuite/sales-orders`)
    const { data: unitNumbers, loading: unitsLoading } = useFetch<Array<Unit>>(`${import.meta.env.VITE_API_BASE}/unit`)
    const { data: trucks, loading: trucksLoading } = useFetch<Array<string>>(`${import.meta.env.VITE_API_BASE}/netsuite/trucks`)
    const { data: parts, loading: partsLoading } = useFetch<Array<Part>>(`${import.meta.env.VITE_API_BASE}/netsuite/items`)

    const [requester] = React.useState<string | undefined>(user?.name)
    const [orderDate] = React.useState<string>(new Date().toLocaleDateString())
    const [reqClass, setReqClass] = React.useState<ReqClass>({ afe: "", so: "" })
    const [relAsset, setRelAsset] = React.useState<RelAsset>({ unit: null, truck: "" })
    const [urgency, setUrgency] = React.useState<string>("")
    const [orderType, setOrderType] = React.useState<string>("")
    const [region, setRegion] = React.useState<string>("")
    const [rows, setRows] = React.useState<Array<OrderRow>>([])

    const handleSubmit = () => {
        console.log("Submitted")
    }

    const disableSubmit: boolean = !requester &&
        !orderDate &&
        (!reqClass.afe || !reqClass.so) &&
        (!relAsset.unit || !relAsset.truck) &&
        !urgency &&
        !orderType &&
        !region &&
        rows.length === 0

    const onAfeChange = (_e: React.SyntheticEvent, value: string | null) => {
        setReqClass((prevState) => {
            return ({
                ...prevState,
                afe: value ? value : ""
            })
        })
    }
    const onSoChange = (_e: React.SyntheticEvent, value: string | null) => {
        setReqClass((prevState) => {
            return ({
                ...prevState,
                so: value ? value : ""
            })
        })
    }
    const onUnitNumberChange = (_e: React.SyntheticEvent, value: Unit | null) => {
        setRelAsset((prevState) => {
            return ({
                ...prevState,
                unit: value ? value : null
            })
        })
    }
    const onTruckChange = (_e: React.SyntheticEvent, value: string | null) => {
        setRelAsset((prevState) => {
            return ({
                ...prevState,
                truck: value ? value : ""
            })
        })
    }

    const onCreateRow = () => {
        setRows([...rows, { qty: 1, itemNumber: "", description: "" }])
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
        tempRows[index] = row
        setRows(tempRows)
    }

    return (
        <Box sx={{
            width: "100%", maxHeight: "calc(100% - 64px)", bgcolor: "background.paper", margin: "15px", padding: "10px", borderRadius: "0.5rem",
            overflow: "auto", border: "5px solid", borderColor: "background.paper"
        }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h2 style={{ margin: "5px" }}>New Parts Requisition</h2>
                <Grid container spacing={2} sx={{ width: "100%" }}>
                    <Grid xs={4}>
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
                                    value={orderDate}
                                    InputProps={{ readOnly: true }}
                                />
                                <b><p style={{ margin: "20px 0px 0px 0px" }}>Class:</p></b>
                                <Divider />
                                <Autocomplete
                                    options={afeNumbers ? afeNumbers : []}
                                    onChange={onAfeChange}
                                    loading={afeLoading}
                                    renderInput={(params) => <StyledTextField
                                        {...params}
                                        variant="standard"
                                        label="AFE #"
                                        value={reqClass.afe}
                                    />}
                                />
                                <Autocomplete
                                    options={soNumbers ? soNumbers : []}
                                    onChange={onSoChange}
                                    loading={soLoading}
                                    renderInput={(params) => <StyledTextField
                                        {...params}
                                        variant="standard"
                                        label="SO #"
                                        value={reqClass.so}
                                    />}
                                />
                                <b><p style={{ margin: "20px 0px 0px 0px" }}>Related Asset:</p></b>
                                <Divider />
                                <Autocomplete
                                    options={unitNumbers ? unitNumbers : []}
                                    getOptionLabel={(option: Unit) => option.unitNumber}
                                    onChange={onUnitNumberChange}
                                    loading={unitsLoading}
                                    renderInput={(params) => <StyledTextField
                                        {...params}
                                        variant="standard"
                                        label="Unit #"
                                        value={relAsset.unit}
                                    />}
                                />
                                <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                    <p style={{ marginTop: "10px", marginRight: "10px" }}>Location:</p>
                                    {relAsset.unit ?
                                        <p style={{ marginTop: "10px" }}>{relAsset.unit.location}</p> : null
                                    }
                                </div>
                                <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                    <p style={{ marginTop: "5px", marginRight: "10px" }}>Customer:</p>
                                    {relAsset.unit ?
                                        <p style={{ marginTop: "5px" }}>{relAsset.unit.customer}</p> : null
                                    }
                                </div>
                                <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                    <p style={{ marginTop: "5px", marginRight: "10px" }}>Status:</p>
                                    {relAsset.unit ?
                                        <p style={{ marginTop: "5px" }}>{relAsset.unit.status}</p> : null
                                    }
                                </div>
                                <b><p style={{ margin: "5px 0px 0px 0px" }}>OR:</p></b>
                                <Autocomplete
                                    options={trucks ? trucks : []}
                                    onChange={onTruckChange}
                                    loading={trucksLoading}
                                    renderInput={(params) => <StyledTextField
                                        {...params}
                                        variant="standard"
                                        label="Truck #"
                                        value={relAsset.truck}
                                    />}
                                />
                            </Box>
                        </Item>
                    </Grid>
                    <Grid xs={8}>
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
                                <FormControl>
                                    <RadioGroup row>
                                        {ORDER_TYPE.map((val) => {
                                            return (
                                                <FormControlLabel
                                                    value={orderType}
                                                    onChange={() => setOrderType(val)}
                                                    control={<Radio disableRipple sx={{ paddingRight: "2px" }} checked={orderType === val} />}
                                                    label={val}
                                                    defaultChecked={false}
                                                    key={val}
                                                />
                                            )
                                        })}
                                    </RadioGroup>
                                </FormControl>
                                <b><p style={{ margin: "20px 0px 0px 0px" }}>Operational Region:</p></b>
                                <Divider />
                                <FormControl>
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
                            marginTop: "15px", border: relAsset.unit ? UNIT_PLANNING.includes(relAsset.unit.unitNumber) ?
                                "3px solid red" :
                                "3px solid transparent" :
                                "3px solid transparent"
                        }} >
                            <Box>
                                <b><p style={{ margin: 0 }}>Unit Planning Approval Status:</p></b>
                                <Divider />
                                {relAsset.unit ?
                                    UNIT_PLANNING.includes(relAsset.unit.unitNumber) ?
                                        <b><p style={{ marginTop: "5px", color: "red" }}>Travis Yount Must Approve Non-PM Parts</p></b> :
                                        <p style={{ marginTop: "5px" }}>No Additional Approval Needed</p> :
                                    <p style={{ marginTop: "5px" }}>No Additional Approval Needed</p>
                                }
                                <b><p style={{ margin: "20px 0px 0px 0px" }}>Engine:</p></b>
                                <Divider />
                                <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                    <p style={{ marginTop: "5px", marginRight: "10px" }}>Make & Model:</p>
                                    {relAsset.unit ?
                                        <p style={{ marginTop: "5px" }}>{relAsset.unit.engine}</p> : null
                                    }
                                </div>
                                <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                    <p style={{ marginRight: "10px", marginTop: 0 }}>S/N:</p>
                                    {relAsset.unit ?
                                        <p style={{ margin: 0 }}>{relAsset.unit.engineSerialNum}</p> : null
                                    }
                                </div>
                                <b><p style={{ margin: "10px 0px 0px 0px" }}>Compressor Frame:</p></b>
                                <Divider />
                                <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                    <p style={{ marginTop: "5px", marginRight: "10px" }}>Make:</p>
                                    {relAsset.unit ?
                                        <p style={{ marginTop: "5px" }}>{relAsset.unit.compressorFrame}</p> : null
                                    }
                                </div>
                                <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                    <p style={{ marginRight: "10px", marginTop: 0 }}>Model:</p>
                                    {relAsset.unit ?
                                        <p style={{ margin: 0 }}>{relAsset.unit.compressorFrameFamily}</p> : null
                                    }
                                </div>
                                <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                    <p style={{ marginRight: "10px", marginTop: 0 }}>S/N:</p>
                                    {relAsset.unit ?
                                        <p style={{ margin: 0 }}>{relAsset.unit.compressorFrameSN}</p> : null
                                    }
                                </div>
                                <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                    <p style={{ marginRight: "10px", marginTop: 0 }}>Stages:</p>
                                    {relAsset.unit ?
                                        <p style={{ margin: 0 }}>{relAsset.unit.stages}</p> : null
                                    }
                                </div>
                                <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                    <p style={{ marginRight: "10px", marginTop: 0, marginBottom: 0 }}>Cylinder Size:</p>
                                    {relAsset.unit ?
                                        <p style={{ margin: 0 }}>{relAsset.unit.cylinderSize}</p> : null
                                    }
                                </div>
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
                                        <TableCell width={"5%"}></TableCell>
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
                                                        getOptionLabel={(option: Part) => `${option.values.itemid}` + (option.values.salesdescription ? ` - ${option.values.salesdescription}` : "")}
                                                        onChange={onPartChange(index)}
                                                        loading={partsLoading}
                                                        filterOptions={createFilterOptions({
                                                            matchFrom: "any",
                                                            limit: 500
                                                        })}
                                                        renderInput={(params) => <StyledTextField
                                                            {...params}
                                                            variant="standard"
                                                            value={rows[index].itemNumber}
                                                        />}
                                                    />
                                                </TableCell>
                                                <TableCell>{row.description}</TableCell>
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
}