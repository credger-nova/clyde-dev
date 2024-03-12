export interface NetsuitePart {
    recordType: string,
    id: string,
    values: {
        itemid: string,
        salesdescription: string,
        averagecost: string,
        custitem_order_mode: Array<{ value: string, text: string }>
    }
}

export interface Part {
    id: string,
    itemNumber: string,
    description: string,
    cost: string,
    mode: string
}