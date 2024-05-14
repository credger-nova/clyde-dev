import { Unit } from "./unit"
import { Comment } from "./comment"
import { File } from "./file"
import { NovaUser } from "./novaUser"
import { AFE } from "./afe"
import { SalesOrder } from "./netsuite/sales-order"
import { Truck } from "./netsuite/truck"
import { Location } from "./netsuite/location"

export interface OrderRow {
    id: string,
    qty: number,
    itemNumber: string,
    description: string | null,
    cost: number | null,
    mode: string | null,
    received: number
}

export interface PartsReq {
    id: number,
    requester: NovaUser,
    contact?: NovaUser,
    date: Date,
    billable: boolean,
    quoteOnly: boolean,
    warrantyJob: boolean,
    afe?: AFE,
    salesOrder?: SalesOrder,
    unit?: Unit,
    truck?: Truck,
    urgency: string,
    orderType: string,
    pickup?: Location,
    region: string,
    parts: Array<OrderRow>,
    comments: Array<Comment>,
    files: Array<File>,
    status: string,
    amex: boolean,
    vendor?: string,
    conex: boolean,
    conexName?: Location,
    updated: Date
}

export interface PartsReqQuery {
    user: NovaUser | undefined | null,
    searchString?: string,
    id?: string,
    afe?: Array<string>, // Array of AFE IDs
    salesOrder?: Array<string>, // Array of SO IDs
    unitNumber?: Array<string>,
    truck?: Array<string>, // Array of truck IDs
    part?: Array<string>,
    requester?: Array<string>, // Array of user IDs
    customer?: Array<string>,
    location?: Array<string>,
    region?: Array<string>,
    urgency?: Array<string>,
    status?: Array<string>,
    vpApproval?: boolean,
    scAll?: boolean
}

export interface CreatePartsReq extends Omit<PartsReq, "id" | "parts" | "comments" | "files"> {
    parts: Array<Omit<OrderRow, "id">>,
    comments: Array<Omit<Comment, "id">>,
    files: Array<string>
}

export interface UpdatePartsReq extends Omit<PartsReq, "requester" | "date" | "updated"> {
    delRows: Array<OrderRow>,
    newFiles: Array<string>,
    delFiles: Array<string>
}