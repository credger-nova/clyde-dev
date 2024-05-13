export interface Part {
    id: string,
    itemNumber: string,
    description: string | null,
    cost: number | null,
    mode: string | null,
    type: string,
    active: boolean
}