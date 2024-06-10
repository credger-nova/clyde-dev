import { OrderRow } from "../types/partsReq"
import { Unit } from "../types/unit"
import { UNIT_PLANNING } from "./unitPlanning"

export function toTitleCase(text: string): string {
    const newText = text
        .split(" ")
        .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
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

export function getThreshold(hp: number) {
    if (hp > 100 && hp <= 400) {
        return 2000
    } else if (hp > 400 && hp <= 1000) {
        return 3000
    } else if (hp > 1000) {
        return 5000
    } else {
        return 0
    }
}

export function getNonPM(rows: Array<OrderRow>) {
    const nonPM = rows.filter((row) => row.mode !== "PM PARTS")

    return nonPM.length > 0
}

export function opsVpApprovalRequired(unit: Unit | null, rows: Array<OrderRow>) {
    if (unit) {
        if (
            UNIT_PLANNING.includes(unit.unitNumber) &&
            getThreshold(unit.oemHP) <= calcCost(rows as Array<OrderRow>) &&
            getNonPM(rows as Array<OrderRow>)
        ) {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}

export function isEmpty(obj: object) {
    return Object.keys(obj).length === 0 ? true: false
}