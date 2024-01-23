import { Unit } from "@prisma/client"

export interface OrderRow {
    id: string,
    qty: number,
    itemNumber: string,
    cost: string | null,
    description: string | null
}

export interface Comment {
    id: string,
    comment: string,
    name: string,
    timestamp: Date
}

export interface PartsReq {
    id: number,
    requester: string,
    date: Date,
    afe: string,
    so: string,
    unit: Unit,
    truck: string,
    urgency: string,
    orderType: string,
    region: string,
    parts: Array<OrderRow>,
    comments: Array<Comment>,
    status: string,
    updated: Date
}

export interface UpdatePartsReq extends Omit<PartsReq, "requester" | "date" | "updated"> {
    delRows: Array<OrderRow>
}