import { NovaUser } from "./novaUser"
import { Unit } from "@prisma/client"

export interface ServiceReport {
    id: string
    date: Date
    observer: NovaUser
    startWorkTimestamp?: Date
    stopWorkTimestamp?: Date
    operationCodes?: string
    shopOperationCodes?: string
    operationCodesThirdParty?: string
    unit?: Unit
    functionPerformed?: string
    region?: string
    whatWasFound?: string
    whatWasPerformed?: string
    engineHours?: number
    hoursWorked?: number
}
