import { File, Unit, Comment } from "@prisma/client"
import { NovaUser } from "./novaUser"
import { AFE } from "./afe"

export interface OrderRow {
    id: string,
    qty: number,
    itemNumber: string,
    cost: string | null,
    description: string | null,
    received: number,
    mode: string
}

export interface PartsReq {
    id: number,
    requester: NovaUser,
    contact?: NovaUser,
    date: Date,
    billable: boolean,
    quoteOnly: boolean,
    afe?: AFE,
    so?: string,
    unit?: Unit,
    truck?: string,
    urgency: string,
    orderType: string,
    pickup?: string,
    region: string,
    parts: Array<OrderRow>,
    comments: Array<Comment>,
    files: Array<File>,
    status: string,
    amex: boolean,
    vendor?: string,
    updated: Date
}

export interface PartsReqQuery {
    user: NovaUser | undefined | null,
    searchString?: string,
    id?: string,
    afe?: Array<string>, // Array of AFE IDs
    so?: Array<string>,
    unitNumber?: Array<string>,
    truck?: Array<string>,
    part?: Array<string>,
    requester?: Array<string>, // Array of user IDs
    customer?: Array<string>,
    location?: Array<string>,
    region?: Array<string>,
    urgency?: Array<string>,
    status?: Array<string>
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