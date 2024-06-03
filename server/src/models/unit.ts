import { Unit } from "@prisma/client"

export interface UnitStatus {
    unitNumber: string
    location?: string
    customer?: string
    engineFamily?: string
    status: string
    statusMessage?: string
    telemetry?: string
    timestamp: Date
    unit: Unit
}
