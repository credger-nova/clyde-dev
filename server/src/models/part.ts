export interface NetsuitePart {
    recordType: string,
    id: string,
    values: {
        itemid: string,
        salesdescription: string,
        cost: string
    }
}

export interface Part {
    id: string,
    itemNumber: string,
    description: string,
    cost: string
}