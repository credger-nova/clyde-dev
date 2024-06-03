import { Unit } from "@prisma/client"

export interface Parameter {
    unitNumber: string
    name: string
    parameter: string
    timestamp: Date
    unit: Unit
}
