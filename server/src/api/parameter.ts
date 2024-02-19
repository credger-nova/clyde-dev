import { prisma } from "../utils/prisma-client"
import { UnitStatus } from "../models/unit"

const OIL_PRES_UNITS = ["N11073", "N90128"]
const VOLTAGE_UNITS = ["HC15153", "HC11077", "HC90014"]
const RPM = ["Engine Speed", "Driver RPM", "Engine Speed from EICS"]
const STATUS_MESSAGE = ["Fault code"]

const SORT_ORDER = ["Stopped", "Cold", "Running"]

// This helper function performs a groupby type action on a list with a given key
const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
    arr.reduce((groups, item) => {
        (groups[key(item)] ||= []).push(item);
        return groups;
    }, {} as Record<K, T[]>)

// Get all parameters
export const getAllParameters = async () => {
    const allParameters = await prisma.parameter.findMany()

    let groupedParams = groupBy(allParameters, i => i.unitNumber)

    return groupedParams
}

// Get cleaned up version of parameters suitable for displaying Unit Status
export const getStatus = async () => {
    const allParameters = await prisma.parameter.findMany({
        where: {
            OR: [
                { name: { in: RPM } },
                { name: { in: STATUS_MESSAGE } },
                { name: "Comp Oil Pres" },
                { name: "External DC Voltage" }
            ]
        },
        include: {
            unit: {
                select: {
                    telemetry: true,
                    location: true,
                    customer: true,
                    engineFamily: true
                }
            }
        }
    })

    let grouped = groupBy(allParameters, i => i.unitNumber)

    let result: Array<UnitStatus> = []

    Object.entries(grouped).forEach(([key, value]) => {
        let unitStatus: UnitStatus = { unitNumber: key } as UnitStatus

        if (OIL_PRES_UNITS.includes(key)) {
            if (Number(value.find(i => i.name === "Comp Oil Pres")!.value) >= 30) {
                unitStatus.status = "Running"
            } else {
                unitStatus.status = "Stopped"
            }
        } else if (VOLTAGE_UNITS.includes(key)) {
            if (Number(value.find(i => i.name === "External DC Voltage")!.value) >= 26) {
                unitStatus.status = "Running"
            } else {
                unitStatus.status = "Stopped"
            }
        } else {
            if (value.find(i => RPM.includes(i.name))) {
                if (Number(value.find(i => RPM.includes(i.name))!.value) >= 10) {
                    unitStatus.status = "Running"
                } else {
                    unitStatus.status = "Stopped"
                }
            }
        }

        const message = value.find(i => STATUS_MESSAGE.includes(i.name))
        unitStatus.statusMessage = message ? message.value! : ""

        const unit = value.find(i => i.unitNumber === key)

        unitStatus.timestamp = value.reduce((a, b) => a.timestamp! > b.timestamp! ? a : b).timestamp!
        unitStatus.location = unit?.unit?.location!
        unitStatus.customer = unit?.unit?.customer!
        unitStatus.engineFamily = unit?.unit?.engineFamily!
        unitStatus.telemetry = unit?.unit?.telemetry!

        if (((new Date().valueOf() - unitStatus.timestamp.valueOf()) / (1000 * 24 * 60 * 60)) > 1) {
            unitStatus.status = "Cold"
        }

        result.push(unitStatus)
    })

    result.sort((a, b) => SORT_ORDER.indexOf(a.status) - SORT_ORDER.indexOf(b.status))

    return result
}

// Get parameters for a single unit
export const getParameters = async (unitNum: string) => {
    const unitParameters = await prisma.parameter.findMany({
        where: {
            unitNumber: unitNum
        }
    })

    if (unitParameters.length > 0) {
        return unitParameters
    } else {
        return null
    }
}