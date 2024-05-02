import * as React from "react"

import { useAuth0 } from "@auth0/auth0-react"
import { useAFEs } from "../../hooks/afe"
import { useSOs } from "../../hooks/so"
import { useUnits } from "../../hooks/unit"
import { useTrucks } from "../../hooks/truck"
import { useParts } from "../../hooks/parts"
import { useWarehouses } from "../../hooks/warehouse"
import { useNovaUser } from "../../hooks/user"
import { useUpdatePartsReq, useSumPrWithAfe } from "../../hooks/partsReq"
import { useUploadFiles } from "../../hooks/storage"
import { useVendors } from "../../hooks/vendor"
import { useNavigate } from "react-router-dom"

import { opsVpApprovalRequired, toTitleCase, calcCost } from "../../utils/helperFunctions"
import { TITLES } from "../../utils/titles"

import { OrderRow, PartsReq, UpdatePartsReq } from "../../types/partsReq"
import { Unit } from "../../types/unit"
import { Part } from "../../types/part"
import { Comment } from "../../types/comment"
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
import InputAdornment from '@mui/material/InputAdornment'
import parse from 'autosuggest-highlight/parse'
import match from 'autosuggest-highlight/match'
import theme from "../../css/theme"
import Popper, { PopperProps } from '@mui/material/Popper'
import Files from "./Files"
import AddFileButton from "./AddFileButton"
import { File as IFile } from "../../types/file"
import Skeleton from '@mui/material/Skeleton'
import Checkbox from '@mui/material/Checkbox'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import CloseIcon from '@mui/icons-material/Close'

const PERMIAN_REGIONS = ["North Permian", "South Permian", "Pecos", "Carlsbad"]

const URGENCY = ["Unit Down", "Unit Set", "Rush", "Standard"]
const ORDER_TYPE = [{ type: "Rental" }, { type: "Third-Party" }, { type: "Shop Supplies" }, { type: "Truck Supplies" }, { type: "Stock", titles: ["Supply Chain", "Software"] }]
const REGION = ["East Texas", "South Texas", "Midcon", "North Permian", "South Permian", "Pecos", "Carlsbad"]
const STATUS: Array<{ status: string, titles: Array<string> }> = [
    {
        status: "Pending Approval",
        titles: TITLES.find(item => item.group === "IT")?.titles ?? []
    },
    {
        status: "Pending Quote",
        titles: (TITLES.filter(item => item.group === "Ops Manager" || item.group === "Shop Supervisor").map(group => group.titles).flat())
            .concat(TITLES.filter(item => item.group === "Ops Director" || item.group === "Shop Director").map(group => group.titles).flat())
            .concat(TITLES.find(item => item.group === "Emissions Manager")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "IT")?.titles ?? [])
    },
    {
        status: "Quote Provided - Pending Approval",
        titles: (TITLES.find(item => item.group === "Supply Chain")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "IT")?.titles ?? [])
    },
    {
        status: "Rejected - Adjustments Required",
        titles: (TITLES.filter(item => item.group === "Ops Manager" || item.group === "Shop Supervisor").map(group => group.titles).flat())
            .concat(TITLES.filter(item => item.group === "Ops Director" || item.group === "Shop Director").map(group => group.titles).flat())
            .concat(TITLES.find(item => item.group === "Ops Vice President")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "Emissions Manager")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "Supply Chain Management")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "IT")?.titles ?? [])
    },
    {
        status: "Rejected - Closed",
        titles: (TITLES.filter(item => item.group === "Ops Manager" || item.group === "Shop Supervisor").map(group => group.titles).flat())
            .concat(TITLES.filter(item => item.group === "Ops Director" || item.group === "Shop Director").map(group => group.titles).flat())
            .concat(TITLES.find(item => item.group === "Ops Vice President")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "Emissions Manager")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "Supply Chain Management")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "IT")?.titles ?? [])
    },
    {
        status: "Approved - On Hold",
        titles: (TITLES.filter(item => item.group === "Ops Manager" || item.group === "Shop Supervisor").map(group => group.titles).flat())
            .concat(TITLES.filter(item => item.group === "Ops Director" || item.group === "Shop Director").map(group => group.titles).flat())
            .concat(TITLES.find(item => item.group === "Ops Vice President")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "Emissions Manager")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "Supply Chain Management")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "IT")?.titles ?? [])
    },
    {
        status: "Approved",
        titles: (TITLES.filter(item => item.group === "Ops Manager" || item.group === "Shop Supervisor").map(group => group.titles).flat())
            .concat(TITLES.filter(item => item.group === "Ops Director" || item.group === "Shop Director").map(group => group.titles).flat())
            .concat(TITLES.find(item => item.group === "Ops Vice President")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "Emissions Manager")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "Supply Chain Management")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "IT")?.titles ?? [])
    },
    {
        status: "Sourcing - In Progress",
        titles: (TITLES.find(item => item.group === "Supply Chain")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "Supply Chain Management")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "IT")?.titles ?? [])
    },
    {
        status: "Sourcing - Information Required",
        titles: (TITLES.filter(item => item.group === "Ops Manager" || item.group === "Shop Supervisor").map(group => group.titles).flat())
            .concat(TITLES.find(item => item.group === "Emissions Manager")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "Supply Chain")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "Supply Chain Management")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "IT")?.titles ?? [])
    },
    {
        status: "Sourcing - Information Provided",
        titles: (TITLES.find(item => item.group === "Supply Chain")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "IT")?.titles ?? [])
    },
    {
        status: "Sourcing - Amex Approved",
        titles: (TITLES.find(item => item.group === "Supply Chain Management")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "IT")?.titles ?? [])
    },
    {
        status: "Sourcing - Request to Cancel",
        titles: (TITLES.find(item => item.group === "Supply Chain")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "Supply Chain Management")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "IT")?.titles ?? [])
    },
    {
        status: "Ordered - Awaiting Parts",
        titles: (TITLES.find(item => item.group === "Supply Chain")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "Supply Chain Management")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "IT")?.titles ?? [])
    },
    {
        status: "Completed - Parts Staged/Delivered",
        titles: (TITLES.find(item => item.group === "Supply Chain")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "Supply Chain Management")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "IT")?.titles ?? [])
    },
    {
        status: "Closed - Partially Received",
        titles: TITLES.find(item => item.group === "IT")?.titles ?? []
    },
    {
        status: "Closed - Parts in Hand",
        titles: TITLES.find(item => item.group === "IT")?.titles ?? []
    },
    {
        status: "Closed - Order Canceled",
        titles: (TITLES.filter(item => item.group === "Ops Manager" || item.group === "Shop Supervisor").map(group => group.titles).flat())
            .concat(TITLES.filter(item => item.group === "Ops Director" || item.group === "Shop Director").map(group => group.titles).flat())
            .concat(TITLES.find(item => item.group === "Emissions Manager")?.titles ?? [])
            .concat(TITLES.find(item => item.group === "IT")?.titles ?? [])
    }
]

const FIELD_SHOP_SERVICE_TITLES = TITLES.filter(item => item.group === "Field Service" || item.group === "Shop Service").map(group => group.titles).flat()
const OPS_SHOP_MANAGER_TITLES = TITLES.filter(item => item.group === "Ops Manager" || item.group === "Shop Supervisor").map(group => group.titles).flat()
const OPS_SHOP_DIRECTOR_TITLES = TITLES.filter(item => item.group === "Ops Director" || item.group === "Shop Director").map(group => group.titles).flat()
const SHOP_TITLES = TITLES.filter(item => item.group.includes("Shop")).map((group) => group.titles).flat()
const SVP_TITLES = TITLES.find(item => item.group === "Ops Vice President")?.titles ?? []
const EMISSIONS_MANAGER_TITLES = TITLES.find(item => item.group === "Emissions Manager")?.titles ?? []
const SUPPLY_CHAIN_TITLES = TITLES.find(item => item.group === "Supply Chain")?.titles ?? []
const SC_MANAGEMENT_TITLES = TITLES.find(item => item.group === "Supply Chain Management")?.titles ?? []
const EXEC_TITLES = TITLES.find(item => item.group === "Executive Management")?.titles ?? []
const IT_TITLES = TITLES.find(item => item.group === "IT")?.titles ?? []

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

function getAvailableStatus(user: NovaUser | undefined, currStatus: string) {
    if (user) {
        if (currStatus === "Pending Quote") {
            return ["Quote Provided - Pending Approval"]
        }

        if (currStatus === "Sourcing - Information Required" && (OPS_SHOP_MANAGER_TITLES.includes(user.jobTitle) || FIELD_SHOP_SERVICE_TITLES.includes(user.jobTitle) ||
            EMISSIONS_MANAGER_TITLES.includes(user.jobTitle))) {
            return ["Sourcing - Information Provided"]
        }

        if (currStatus === "Sourcing - Request to Cancel" && (OPS_SHOP_MANAGER_TITLES.includes(user.jobTitle) || OPS_SHOP_DIRECTOR_TITLES.includes(user.jobTitle) ||
            EMISSIONS_MANAGER_TITLES.includes(user.jobTitle))) {
            return ["Closed - Order Canceled", "Sourcing - Information Provided"]
        }

        let status = STATUS.filter(item => item.titles.includes(user.jobTitle) && item.status !== "Quote Provided - Pending Approval")

        if (OPS_SHOP_MANAGER_TITLES.includes(user.jobTitle)) {
            status = status.filter(item => !item.status.includes("Sourcing"))
        }

        if (SUPPLY_CHAIN_TITLES.includes(user.jobTitle) || SC_MANAGEMENT_TITLES.includes(user.jobTitle)) {
            if (currStatus === "Ordered - Awaiting Parts" || currStatus === "Completed - Parts Staged - Delivered") {
                status = status.filter(item => item.status !== "Sourcing - Request to Cancel")
            }
            if (currStatus === "Pending Approval") {
                return ["Rejected - Adjustments Required", "Rejected - Closed", "Approved - On Hold", "Approved"]
            }
        }

        return status.map(item => item.status)
    } else {
        return []
    }
}

interface Props {
    partsReq: PartsReq,
    save: boolean,
    setSave: React.Dispatch<React.SetStateAction<boolean>>,
    setSaveDisabled: React.Dispatch<React.SetStateAction<boolean>>,
    edit: boolean,
    reset: boolean,
    setReset: React.Dispatch<React.SetStateAction<boolean>>
}

interface PartOption extends Part {
    inputValue?: string
}

export default function EditPartsReqForm(props: Props) {
    const { partsReq, save, setSave, setSaveDisabled, edit, reset, setReset } = props

    const { user } = useAuth0()
    const navigate = useNavigate()

    const { data: novaUser, isFetched } = useNovaUser(user?.email)

    const { data: afes, isFetching: afeFetching } = useAFEs()
    const { data: soNumbers, isFetching: soFetching } = useSOs()
    const { data: unitNumbers, isFetching: unitsFetching } = useUnits()
    const { data: trucks, isFetching: trucksFetching } = useTrucks()
    const { data: parts, isFetching: partsFetching } = useParts()
    const { data: warehouses, isFetching: warehousesFetching } = useWarehouses()
    const { data: vendors, isFetching: vendorsFetching } = useVendors()

    const { mutateAsync: updatePartsReq } = useUpdatePartsReq()
    const { mutateAsync: uploadFiles } = useUploadFiles()

    const [status, setStatus] = React.useState<string>(partsReq.status)
    const [requester] = React.useState<NovaUser>(partsReq.requester)
    const [contact, setContact] = React.useState<NovaUser | null>(partsReq.contact ?? null)
    const [orderDate] = React.useState<Date>(partsReq.date)
    const [billable] = React.useState<boolean>(partsReq.billable)
    const [warrantyJob] = React.useState<boolean>(partsReq.warrantyJob)
    const [afe, setAfe] = React.useState<AFE | null>(partsReq.afe ?? null)
    const [so, setSo] = React.useState<string | null>(partsReq.so ?? null)
    const [unit, setUnit] = React.useState<Unit | null>(partsReq.unit ?? null)
    const [truck, setTruck] = React.useState<string | null>(partsReq.truck ?? null)
    const [urgency, setUrgency] = React.useState<string | null>(partsReq.urgency)
    const [orderType, setOrderType] = React.useState<string | null>(partsReq.orderType)
    const [pickup, setPickup] = React.useState<string | null>(partsReq.pickup ?? null)
    const [region, setRegion] = React.useState<string | null>(partsReq.region)
    const [rows, setRows] = React.useState<Array<Omit<OrderRow, "id">>>(partsReq.parts)
    const [delRows, setDelRows] = React.useState<Array<OrderRow>>([])
    const [comment, setComment] = React.useState<string>("")
    const [comments, setComments] = React.useState<Array<Omit<Comment, "id">>>(partsReq.comments)
    const [files] = React.useState<Array<IFile>>(partsReq.files)
    const [newFiles, setNewFiles] = React.useState<Array<File>>([])
    const [deleteFiles, setDeleteFiles] = React.useState<Array<string>>([])
    const [amex, setAmex] = React.useState<boolean>(partsReq.amex)
    const [vendor, setVendor] = React.useState<string | null>(partsReq.vendor ?? null)
    const [conex, setConex] = React.useState<boolean>(partsReq.conex)
    const [conexName, setConexName] = React.useState<string | null>(partsReq.conexName ?? null)
    const [prExceedsAfe, setPrExceedsAfe] = React.useState<boolean>(false)
    const [needsComment, setNeedsComment] = React.useState<boolean>(false)
    const [menuIndex, setMenuIndex] = React.useState<number | null>(null)
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)
    const confirmDeleteRowOpen = Boolean(anchorEl)

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
        if (!requester || !orderDate || !urgency || !orderType || !(rows.length > 0) || needsComment ||
            ((!unit && !truck && !so) && orderType !== "Shop Supplies")) {
            setSaveDisabled(true)
        } else {
            if (!rows[0].itemNumber) {
                setSaveDisabled(true)
            } else {
                setSaveDisabled(false)
            }
        }
    }, [requester, orderDate, afe, so, urgency, orderType, rows, needsComment, setSaveDisabled, truck, unit])

    React.useEffect(() => {
        if (afe) {
            if (calcCost(rows as Array<OrderRow>) <= Number(afe.amount) - afeExistingAmount!) {
                setPrExceedsAfe(false)
            } else {
                setPrExceedsAfe(true)
            }
        }
    }, [afe, afeExistingAmount, rows])

    // Check if a comment is needed
    React.useEffect(() => {
        if (
            (status === "Rejected - Closed" && partsReq.status !== "Rejected - Closed") ||
            (status === "Closed - Order Canceled" && partsReq.status !== "Closed - Order Canceled") ||
            (status === "Sourcing - Request to Cancel" && partsReq.status !== "Sourcing - Request to Cancel") ||
            (status === "Sourcing - Information Provided" && partsReq.status === "Sourcing - Request to Cancel")
        ) {
            const newComments = (comments as Array<Comment>).filter(comment => !comment.id)
            if (newComments.length === 0) {
                setNeedsComment(true)
            } else {
                setNeedsComment(false)
            }
        } else {
            setNeedsComment(false)
        }
    }, [partsReq, status, comments, setNeedsComment])

    // If user cancels an edit session, reset state
    React.useEffect(() => {
        if (reset) {
            setStatus(partsReq.status)
            setContact(partsReq.contact ?? null)
            setAfe(partsReq.afe ?? null)
            setSo(partsReq.so ?? null)
            setUnit(partsReq.unit ?? null)
            setTruck(partsReq.truck ?? null)
            setUrgency(partsReq.urgency)
            setOrderType(partsReq.orderType)
            setPickup(partsReq.pickup ?? null)
            setRegion(partsReq.region)
            setRows(partsReq.parts)
            setDelRows([])
            setComment("")
            setComments(partsReq.comments)
            setNewFiles([])
            setDeleteFiles([])
            setAmex(partsReq.amex)
            setVendor(partsReq.vendor ?? null)
            setConex(partsReq.conex)
            setConexName(partsReq.conexName ?? null)

            setReset(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reset])

    React.useEffect(() => {
        async function update() {
            const updateReq = {
                user: novaUser!,
                updateReq: {
                    id: partsReq.id,
                    contact: contact,
                    billable: billable,
                    warrantyJob: warrantyJob,
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
                    amex: amex,
                    vendor: vendor,
                    conex: conex,
                    conexName: conexName,
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
            }).then(() => {
                navigate("../")
                setSave(false)
            })
        }

        if (save) {
            update()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [save])

    const onStatusChange = (_e: React.SyntheticEvent, value: string | null) => {
        setStatus(value ?? "")

        if (["Sourcing - Information Required", "Ordered - Awaiting Parts", "Completed - Parts Staged/Delivered"]
            .includes(value ?? "") && !partsReq.contact) {
            setContact(novaUser ?? null)
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
    const onPickupChange = (_e: React.SyntheticEvent, value: string | null) => {
        setPickup(value ?? "")
    }

    const onCreateRow = () => {
        setRows([...rows, { qty: 1, itemNumber: "", description: "", cost: "", mode: "", received: 0 }])
    }

    function removeRow(index: number) {
        const tempRows = [...rows]
        tempRows.splice(index, 1)
        setRows(tempRows)

        if ((rows[index] as OrderRow).id) {
            setDelRows([...delRows, rows[index] as OrderRow])
        }

        setAnchorEl(null)
    }

    const handleDeleteRowClick = (e: React.MouseEvent<HTMLElement>, index: number) => {
        if (!rows[index].itemNumber) {
            removeRow(index)
        } else {
            setMenuIndex(index)
            setAnchorEl(e.currentTarget)
        }
    }

    const handleDeleteRowClose = () => {
        setMenuIndex(null)
        setAnchorEl(null)
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

    const onReceivedChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const tempRows = [...rows]
        const row = { ...tempRows[index] }
        row.received = Number(e.target.value)
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

    const onAmexChange = () => {
        if (amex) {
            setAmex(false)
            setVendor("")
        } else {
            setAmex(true)
        }
    }

    const onVendorChange = (_e: React.SyntheticEvent, value: string | null) => {
        setVendor(value ?? "")
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

    // Prevent enter key from submitting form
    const handleKeyDown = (e: { keyCode: number; preventDefault: () => void }) => {
        if (e.keyCode === 13) {
            e.preventDefault()
        }
    }

    // Check Status options to determine if they should be disabled
    const getOptionDisabled = (option: string) => {
        if (option === "Completed - Parts Staged/Delivered" || option === "Quote Provided - Pending Approval") {
            if (noRate(rows)) {
                return true
            }
        }

        return false
    }

    function noRate(rows: Array<Omit<OrderRow, "id">>) {
        for (const item of rows) {
            if (!item.cost) {
                return true
            }
        }
        return false
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

    function denyAccess(title: string, status: string, field?: string) {
        if (!edit) {
            return true
        }

        if (field === "Comment" || field === "Document") {
            return false
        }

        // Field/Shop Service permissions
        if (FIELD_SHOP_SERVICE_TITLES.includes(title)) {
            if (status === "Rejected - Adjustments Required") {
                if (field !== "Status") {
                    return false
                }
            }
            if (partsReq.status === "Sourcing - Information Required") {
                if (field !== "Amex") {
                    return false
                }
            }
            if (status === "Completed - Parts Staged/Delivered" || status === "Closed - Partially Received") {
                if (field === "Received") {
                    return false
                }
            }

            return true
        }

        // Ops/Shop Manager permissions
        if (OPS_SHOP_MANAGER_TITLES.includes(title) || EMISSIONS_MANAGER_TITLES.includes(title)) {
            if (partsReq.status === "Pending Approval" || partsReq.status === "Quote Provided - Pending Approval") {
                if (field === "Status" && calcCost(rows as Array<OrderRow>) < 5000 &&
                    !opsVpApprovalRequired(unit, rows as Array<OrderRow>)) {
                    return false
                }
                if (field !== "Status") {
                    return false
                }
            }
            if (partsReq.status === "Rejected - Adjustments Required" &&
                partsReq.requester === novaUser) {
                if (field !== "Status") {
                    return false
                }
            }
            if (partsReq.status === "Approved - On Hold") {
                if (field !== "Amex") {
                    return false
                }
            }
            if (partsReq.status === "Sourcing - Information Required") {
                if (field !== "Amex") {
                    return false
                }
            }
            if (partsReq.status === "Sourcing - Request to Cancel") {
                if (field === "Status") {
                    return false
                }
            }
            if (status === "Completed - Parts Staged/Delivered" || status === "Closed - Partially Received") {
                if (field === "Received") {
                    return false
                }
            }

            return true
        }

        // Ops/Shop Director permissions
        if (OPS_SHOP_DIRECTOR_TITLES.includes(title)) {
            if (partsReq.status === "Pending Approval" || partsReq.status === "Quote Provided - Pending Approval") {
                if (field === "Status" && (calcCost(rows as Array<OrderRow>) < 10000 || partsReq.afe) &&
                    !opsVpApprovalRequired(unit, rows as Array<OrderRow>)) {
                    return false
                }
                if (field !== "Status") {
                    return false
                }
            }
            if (partsReq.status === "Rejected - Adjustments Required" &&
                partsReq.requester === novaUser) {
                if (field !== "Status") {
                    return false
                }
            }
            if (partsReq.status === "Approved - On Hold") {
                if (field !== "Amex") {
                    return false
                }
            }
            if (partsReq.status === "Sourcing - Information Required") {
                if (field !== "Amex") {
                    return false
                }
            }
            if (partsReq.status === "Sourcing - Request to Cancel") {
                if (field === "Status") {
                    return false
                }
            }
            if (status === "Completed - Parts Staged/Delivered" || status === "Closed - Partially Received") {
                if (field === "Received") {
                    return false
                }
            }

            return true
        }

        // Ops Vice President permissions
        if (SVP_TITLES.includes(title)) {
            if (partsReq.status === "Pending Approval" || partsReq.status === "Quote Provided - Pending Approval") {
                if (field === "Status") {
                    return false
                }
            }

            return true
        }

        // Supply Chain permissions
        if (SUPPLY_CHAIN_TITLES.includes(title)) {
            if (partsReq.status === "Approved") {
                return false
            }
            if (partsReq.status === "Pending Quote") {
                return false
            }
            if (partsReq.status === "Approved" || partsReq.status === "Sourcing - Information Required" ||
                partsReq.status === "Sourcing - Information Provided" || partsReq.status === "Ordered - Awaiting Parts") {
                if (field === "Status" || field === "Amex" || (partsReq.status === "Sourcing - Information Provided" &&
                    (field === "Needed" || field === "Item" || field === "Description" || field === "Rate"))
                ) {
                    return false
                }
            }
            if (partsReq.status === "Sourcing - In Progress") {
                if (field === "Status" || field === "Amex") {
                    return false
                }
            }
            if (partsReq.status === "Sourcing - Amex Approved") {
                if (field === "Status") {
                    return false
                }
            }
            if (partsReq.status === "Sourcing - Request to Cancel") {
                if (field === "Item" || field === "Description" || field === "Rate" || field === "Conex") {
                    return true
                }
            }
            if (partsReq.status === "Completed - Parts Staged/Delivered" || status === "Completed - Parts Staged/Delivered") {
                if (field === "Pickup") {
                    return false
                }
            }
            if (field === "Item" || field === "Description" || field === "Rate" || field === "Conex") {
                return false
            }

            return true
        }

        // Supply Chain management permissions
        if (SC_MANAGEMENT_TITLES.includes(title)) {
            if (partsReq.status === "Pending Quote") {
                return false
            }
            if (partsReq.status === "Pending Approval") {
                if (field === "Status") {
                    return false
                }
            }
            if (partsReq.status === "Approved" || partsReq.status === "Sourcing - Information Required" ||
                partsReq.status === "Sourcing - Information Provided" || partsReq.status === "Ordered - Awaiting Parts") {
                if (field === "Status" || field === "Amex") {
                    return false
                }
            }
            if (partsReq.status === "Sourcing - In Progress") {
                if (field === "Status") {
                    return false
                }
            }
            if (partsReq.status === "Sourcing - Pending Amex Approval") {
                if (field === "Status") {
                    return false
                }
            }
            if (partsReq.status === "Completed - Parts Staged/Delivered" || status === "Completed - Parts Staged/Delivered") {
                if (field === "Pickup") {
                    return false
                }
            }
            if (field === "Item" || field === "Description" || field === "Rate" || field === "Conex") {
                return false
            }

            return true
        }

        // Exec management permissions
        if (EXEC_TITLES.includes(title)) {
            return true
        }

        // IT permissions
        if (IT_TITLES.includes(title)) {
            return false
        }

        return true
    }

    if (isFetched) {
        return (
            <Box sx={{
                bgcolor: "background.paper", margin: "15px", padding: "10px", borderRadius: "0.5rem",
                overflow: "auto", border: "5px solid", borderColor: "background.paper"
            }}>
                <form
                    onKeyDown={handleKeyDown}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                >
                    <Grid container spacing={2} sx={{ width: "100%" }}>
                        <Grid xs={12} sm={4}>
                            <Item sx={{ marginBottom: "15px" }}>
                                <Box>
                                    <Autocomplete
                                        options={getAvailableStatus(novaUser, partsReq.status)}
                                        onChange={onStatusChange}
                                        value={status}
                                        getOptionDisabled={getOptionDisabled}
                                        disableClearable
                                        renderInput={(params) => <StyledTextField
                                            {...params}
                                            variant="standard"
                                            label="Status"
                                        />}
                                        //isOptionEqualToValue={(option, value) => option.status === value.status}
                                        renderOption={(props, option, { inputValue }) => {
                                            const matches = match(option, inputValue, { insideWords: true, requireMatchAll: true });
                                            const parts = parse(option, matches);

                                            return (
                                                noRate(rows) &&
                                                    (
                                                        option === "Ordered - Awaiting Parts" || option === "Completed - Parts Staged/Delivered" ||
                                                        option === "Quote Provided - Pending Approval"
                                                    ) ?
                                                    <li {...props}>
                                                        {option}
                                                    </li> :
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
                                        readOnly={denyAccess(novaUser!.jobTitle, status, "Status")}
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
                                        defaultValue={`${requester.firstName} ${requester.lastName}`}
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
                                    {contact &&
                                        <>
                                            <StyledTextField
                                                variant="standard"
                                                label="Supply Chain Contact"
                                                defaultValue={`${contact.firstName} ${contact.lastName}`}
                                                InputProps={{ readOnly: true }}
                                            />
                                            <div>
                                                <i>
                                                    <Typography variant="caption">
                                                        {contact?.jobTitle}
                                                    </Typography>
                                                </i>
                                                {contact?.cellPhone && <i>
                                                    <Typography variant="caption">
                                                        {` | ${contact?.cellPhone}`}
                                                    </Typography>
                                                </i>
                                                }
                                            </div>
                                        </>
                                    }
                                    <StyledTextField
                                        variant="standard"
                                        label="Order Date"
                                        value={new Date(orderDate).toLocaleDateString()}
                                        InputProps={{ readOnly: true }}
                                    />
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <Checkbox
                                            checked={billable}
                                            disableRipple
                                            readOnly
                                            sx={{ paddingLeft: 0 }}
                                        />
                                        <b><p style={{ margin: 0 }}>Billable to customer for Nova unit?</p></b>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <Checkbox
                                            checked={warrantyJob}
                                            disableRipple
                                            sx={{ paddingLeft: 0 }}
                                        />
                                        <b><p style={{ margin: 0 }}>Is this related to a potential warranty from the vendor?</p></b>
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
                                        readOnly={denyAccess(novaUser!.jobTitle, status)}
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
                                        disabled={!!afe}
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
                                        readOnly={denyAccess(novaUser!.jobTitle, status)}
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
                                        readOnly={denyAccess(novaUser!.jobTitle, status)}
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
                                        readOnly={denyAccess(novaUser!.jobTitle, status)}
                                    />
                                </Box>
                            </Item>
                        </Grid>
                        <Grid xs={12} sm={4}>
                            {(status === "Completed - Parts Staged/Delivered" || status === "Closed - Partially Received" ||
                                status === "Closed - Parts in Hand") &&
                                <Item sx={{ marginBottom: "15px" }}>
                                    <Box>
                                        <Autocomplete
                                            options={warehouses ? warehouses.concat("WILL CALL") : []}
                                            loading={warehousesFetching}
                                            onChange={onPickupChange}
                                            value={pickup ?? ""}
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
                                            readOnly={denyAccess(novaUser!.jobTitle, status, "Pickup")}
                                        />
                                    </Box>
                                </Item>
                            }
                            <Item sx={{ marginBottom: "10px" }}>
                                <b><p style={{ margin: 0 }}>Were all these parts taken from a Conex?</p></b>
                                <div
                                    style={{ display: "flex", flexDirection: "row", alignItems: "flex-end" }}
                                >
                                    <Checkbox
                                        checked={conex}
                                        onChange={onConexChange}
                                        disableRipple
                                        disabled={denyAccess(novaUser!.jobTitle, status, "Conex")}
                                    />
                                    <Autocomplete
                                        disabled={!conex || denyAccess(novaUser!.jobTitle, status, "Conex")}
                                        options={warehouses ? warehouses.filter((location) => location.includes("CONEX") || location.includes("STORAGE")
                                            || (location.includes("TRUCK") && EMISSIONS_MANAGER_TITLES.includes(novaUser!.jobTitle))) : []}
                                        loading={warehousesFetching}
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
                                    <FormControl disabled={denyAccess(novaUser!.jobTitle, status)}>
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
                                    <FormControl disabled={(!!unit || !!so) || denyAccess(novaUser!.jobTitle, status)}>
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
                                    <FormControl disabled={!!unit || denyAccess(novaUser!.jobTitle, status)}>
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
                                            <b><p style={{ marginTop: "5px", color: "red" }}>
                                                {PERMIAN_REGIONS.includes(partsReq.region) ?
                                                    "Sean Stewart must approve non-PM parts" :
                                                    "Travis Yount must approve non-PM parts"
                                                }
                                            </p></b> :
                                            <p style={{ marginTop: "5px" }}>No additional approval needed</p> :
                                        <p style={{ marginTop: "5px" }}>No additional approval needed</p>
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
                                marginBottom: "10px", border: [
                                    "Pending Approval", "Pending Quote", "Quote Provided - Pending Approval", "Rejected - Adjustments Required",
                                    "Sourcing - Information Required"
                                ].includes(status) &&
                                    prExceedsAfe ? "3px solid red" : "3px solid transparent"
                            }}>
                                <p style={{ margin: 0 }}><b>Estimated Total Cost: </b>${calcCost(rows as Array<OrderRow>).toFixed(2)}</p>
                                {[
                                    "Pending Approval", "Pending Quote", "Quote Provided - Pending Approval", "Rejected - Adjustments Required",
                                    "Sourcing - Information Required"
                                ].includes(status) &&
                                    prExceedsAfe &&
                                    <b><p style={{ margin: "5px 0px 0px", color: "red" }}>Estimated Cost Exceeds Available AFE Amount</p></b>
                                }
                            </Item>
                            {!["Pending Approval", "Pending Quote", "Quote Provided - Pending Approval", "Rejected - Adjustments Required",
                                "Approved - On Hold", "Rejected - Closed"
                            ].includes(status) &&
                                <Item sx={{ marginBottom: "10px" }}>
                                    <b><p style={{ margin: 0 }}>Is this an Amex request?</p></b>
                                    <div
                                        style={{ display: "flex", flexDirection: "row", alignItems: "flex-end" }}
                                    >
                                        <Checkbox
                                            checked={amex}
                                            onChange={onAmexChange}
                                            disableRipple
                                            disabled={denyAccess(novaUser!.jobTitle, status, "Amex") || noRate(rows)}
                                        />
                                        <Autocomplete
                                            disabled={!amex || denyAccess(novaUser!.jobTitle, status, "Amex")}
                                            options={vendors ? vendors : []}
                                            loading={vendorsFetching}
                                            onChange={onVendorChange}
                                            value={vendor}
                                            renderInput={(params) => <StyledTextField
                                                {...params}
                                                variant="standard"
                                                label="Vendor"
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
                            }
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
                                        disabled={denyAccess(novaUser!.jobTitle, status, "Comment")}
                                        error={needsComment}
                                        helperText={needsComment && "Please enter a reason for status change"}
                                    />
                                    <IconButton
                                        onClick={onAddComment}
                                        disabled={!comment || denyAccess(novaUser!.jobTitle, status, "Comment")}
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
                                                        <i style={{ color: "#838385" }}>
                                                            {comment.name} - {new Date(comment.timestamp).toLocaleDateString()} {new Date(comment.timestamp).toLocaleTimeString()}
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
                                    disabled={denyAccess(novaUser!.jobTitle, status, "Document")}
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
                                        disabled={denyAccess(novaUser!.jobTitle, status, "Document")}
                                    />
                                </Box>
                            </Item>
                        </Grid>
                        <Grid xs={12}>
                            <Item>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            {partsReq.status === "Completed - Parts Staged/Delivered" ||
                                                partsReq.status === "Closed - Partially Received" ?
                                                <TableCell width={"7%"}>Qty Received</TableCell> : null
                                            }
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
                                                    {partsReq.status === "Completed - Parts Staged/Delivered" ||
                                                        partsReq.status === "Closed - Partially Received" ?
                                                        <TableCell>
                                                            <Skeleton
                                                                animation={"wave"}
                                                                sx={{ width: "100%" }}
                                                            />
                                                        </TableCell> : null}
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
                                                    {partsReq.status === "Completed - Parts Staged/Delivered" ||
                                                        partsReq.status === "Closed - Partially Received" ?
                                                        <TableCell>
                                                            <StyledTextField
                                                                type="number"
                                                                variant="standard"
                                                                value={row.received}
                                                                onChange={onReceivedChange(index)}
                                                                InputProps={{
                                                                    inputProps: { min: partsReq.parts[index].received, max: row.qty },
                                                                    readOnly: denyAccess(novaUser!.jobTitle, status, "Received")
                                                                }}
                                                                sx={{ width: "100%" }}
                                                                helperText={!rows[index].itemNumber && " "}
                                                            />
                                                        </TableCell> : null
                                                    }
                                                    <TableCell>
                                                        <StyledTextField
                                                            type="number"
                                                            variant="standard"
                                                            value={row.qty}
                                                            onChange={onQtyChange(index)}
                                                            InputProps={{
                                                                inputProps: { min: 1 },
                                                                readOnly: denyAccess(novaUser!.jobTitle, status, "Needed")
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
                                                            readOnly={denyAccess(novaUser!.jobTitle, status, "Item")}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <StyledTextField
                                                            variant="standard"
                                                            value={row.description}
                                                            onChange={onDescriptionChange(index)}
                                                            helperText={!rows[index].itemNumber && " "}
                                                            disabled={partExists(rows[index].itemNumber) && partIsInventoryItem(rows[index].itemNumber)}
                                                            InputProps={{
                                                                readOnly: denyAccess(novaUser!.jobTitle, status, "Description")
                                                            }}
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
                                                                },
                                                                readOnly: denyAccess(novaUser!.jobTitle, status, "Rate")
                                                            }}
                                                            helperText={!rows[index].itemNumber && " "}
                                                            disabled={partExists(rows[index].itemNumber) && denyAccess(novaUser!.jobTitle, status, "Rate")}
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
                                                                onClick={(e) => handleDeleteRowClick(e, index)}
                                                                disableRipple
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                            <Menu
                                                                anchorEl={anchorEl}
                                                                open={confirmDeleteRowOpen && menuIndex === index}
                                                                onClose={handleDeleteRowClose}
                                                                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                                                                transformOrigin={{ vertical: "bottom", horizontal: "right" }}
                                                            >
                                                                <MenuItem
                                                                    onClick={() => removeRow(index)}
                                                                    disableRipple
                                                                >
                                                                    <DeleteIcon />
                                                                    Remove Part
                                                                </MenuItem>
                                                                <MenuItem
                                                                    onClick={handleDeleteRowClose}
                                                                    disableRipple
                                                                >
                                                                    <CloseIcon />
                                                                    Cancel
                                                                </MenuItem>
                                                            </Menu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                        {partsFetching ? null :
                                            <TableRow>
                                                {partsReq.status === "Completed - Parts Staged/Delivered" ||
                                                    partsReq.status === "Closed - Partially Received" ?
                                                    <TableCell sx={{ border: "none" }} /> : null
                                                }
                                                <TableCell sx={{ border: "none" }} />
                                                <TableCell sx={{ border: "none" }} />
                                                <TableCell sx={{ border: "none" }} />
                                                <TableCell sx={{ border: "none" }} />
                                                <TableCell sx={{ border: "none" }}><b>${calcCost(rows as Array<OrderRow>).toFixed(2)}</b></TableCell>
                                                <TableCell sx={{ border: "none" }} />
                                            </TableRow>
                                        }
                                    </TableBody>
                                </Table>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={onCreateRow}
                                    disabled={partsFetching || denyAccess(novaUser!.jobTitle, status)}
                                    sx={{
                                        marginTop: "5px", backgroundColor: theme.palette.primary.dark,
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
                </form>
            </Box >
        )
    }
}