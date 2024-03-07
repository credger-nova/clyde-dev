import { OrderRow } from "../types/partsReq"

export function toTitleCase(text: string): string {
    const newText = text.split(" ")
        .map(w => w[0].toUpperCase() + w.substring(1).toLowerCase())
        .join(" ")

    return newText
}

export function calcCost(parts: Array<OrderRow>) {
    let sum = 0

    for (const part of parts) {
        sum += Number(part.cost) * part.qty
    }

    return sum
}