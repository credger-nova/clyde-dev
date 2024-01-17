import { Unit } from "@prisma/client"

export interface ReqClass {
    afe: string | null,
    so: string | null
}
export interface RelAsset {
    unit: Unit | null,
    truck: string | null
}
export interface OrderRow {
    qty: number,
    itemNumber: string,
    description: string | null
}

export interface Comment {
    comment: string,
    name: string,
    timestamp: Date
}

export interface PartsReq {
    id: number,
    requester: string,
    date: Date,
    class: ReqClass,
    relAsset: RelAsset,
    urgency: string,
    orderType: string,
    region: string,
    parts: Array<OrderRow>,
    comments: Array<Comment>,
    status: string,
    updated: Date
}