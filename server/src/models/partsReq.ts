import { File, Unit, Comment } from "@prisma/client"

export interface OrderRow {
    id: string,
    qty: number,
    itemNumber: string,
    cost: string | null,
    description: string | null
}

export interface PartsReq {
    id: number,
    requester: string,
    contact: string,
    date: Date,
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
    updated: Date
}

export interface UpdatePartsReq extends Omit<PartsReq, "requester" | "date" | "updated"> {
    delRows: Array<OrderRow>
}