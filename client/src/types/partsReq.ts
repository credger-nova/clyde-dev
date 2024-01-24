import { Unit } from "./unit";

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
    region: string | null,
    parts: Array<OrderRow>,
    comments: Array<Comment>,
    status: string,
    updated: Date
}

export interface CreatePartsReq extends Omit<PartsReq, "id" | "parts" | "comments"> {
    parts: Array<Omit<OrderRow, "id">>,
    comments: Array<Omit<Comment, "id">>
}

export interface UpdatePartsReq extends Omit<PartsReq, "requester" | "date" | "updated"> {
    delRows: Array<OrderRow>
}

export interface Part {
    recordType: string,
    id: string,
    values: {
        itemid: string,
        salesdescription: string,
        cost: string
    }
}

export interface Comment {
    id: string,
    comment: string,
    name: string,
    timestamp: Date
}