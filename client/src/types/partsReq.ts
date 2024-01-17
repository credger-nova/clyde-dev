import { Unit } from "./unit";

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
    description: string | null,
    cost: string | null
}

export interface PartsReq {
    id: number,
    requester: string,
    date: Date,
    class: ReqClass,
    relAsset: RelAsset,
    urgency: string | null,
    orderType: string | null,
    region: string | null,
    parts: Array<OrderRow>,
    comments: Array<Comment>,
    status: string,
    updated: Date
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
    comment: string,
    name: string,
    timestamp: Date
}