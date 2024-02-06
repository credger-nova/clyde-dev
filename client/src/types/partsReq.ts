import { Unit } from "./unit";
import { Comment } from "./comment";
import { File } from "./file";

export interface OrderRow {
    id: string,
    qty: number,
    itemNumber: string,
    description: string | null,
    cost: string | null
}

export interface PartsReq {
    id: number,
    requester: string,
    contact: string,
    date: Date,
    afe: string | null,
    so: string | null,
    unit: Unit | null,
    truck: string | null,
    urgency: string | null,
    orderType: string | null,
    pickup: string,
    region: string | null,
    parts: Array<OrderRow>,
    comments: Array<Comment>,
    files: Array<File>,
    status: string,
    updated: Date
}

export interface PartsReqQuery {
    searchString?: string,
    id?: string,
    afe?: Array<string>,
    so?: Array<string>,
    unitNumber?: Array<string>,
    truck?: Array<string>,
    part?: Array<string>,
    requester?: Array<string>,
    customer?: Array<string>,
    urgency?: Array<string>,
    status?: Array<string>
}

export interface CreatePartsReq extends Omit<PartsReq, "id" | "parts" | "comments"> {
    parts: Array<Omit<OrderRow, "id">>,
    comments: Array<Omit<Comment, "id">>
}

export interface UpdatePartsReq extends Omit<PartsReq, "requester" | "date" | "updated"> {
    delRows: Array<OrderRow>
}