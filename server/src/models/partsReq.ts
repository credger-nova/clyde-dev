import { File, Unit, Comment } from "@prisma/client"
import { NovaUser } from "./novaUser"

export interface OrderRow {
    id: string,
    qty: number,
    itemNumber: string,
    cost: string | null,
    description: string | null,
    received: number
}

export interface PartsReq {
    id: number,
    requester: string,
    contact: string,
    date: Date,
    billable: boolean,
    afe: string,
    so: string,
    unit: Unit,
    truck: string,
    urgency: string,
    orderType: string,
    pickup: string,
    region: string,
    parts: Array<OrderRow>,
    comments: Array<Comment>,
    files: Array<File>,
    status: string,
    amex: boolean,
    vendor: string,
    updated: Date
}

export interface PartsReqQuery {
    user: NovaUser | undefined | null,
    searchString?: string,
    id?: string,
    afe?: Array<string>,
    so?: Array<string>,
    unitNumber?: Array<string>,
    truck?: Array<string>,
    part?: Array<string>,
    requester?: Array<string>,
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