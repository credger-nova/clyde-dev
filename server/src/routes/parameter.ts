import { FastifyInstance, FastifyRequest } from "fastify"
import { prisma } from "../prisma-client"
import { UnitStatus, Parameter } from "../models/types"

const OIL_PRES_UNITS = ["N11073"]
const VOLTAGE_UNITS = ["HC15153", "HC11077", "HC90014"]
const RPM = ["Engine Speed", "Driver RPM", "Engine Speed from EICS"]
const STATUS_MESSAGE = ["Fault code"]


// This helper function performs a groupby type action on a list with a given key
const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
    arr.reduce((groups, item) => {
        (groups[key(item)] ||= []).push(item);
        return groups;
    }, {} as Record<K, T[]>)

async function routes(fastify: FastifyInstance) {
    // Get all unit parameters
    fastify.get("/", async (req, res) => {
        const allParameters = await prisma.parameter.findMany()

        let result = groupBy(allParameters, i => i.unitNumber)

        return result
    })

    // Get trimmed version of unit parameters suited for unit status page
    fastify.get("/status", async (req, res) => {
        const allParameters = await prisma.parameter.findMany({
            where: {
                OR: [
                    { name: { in: RPM } },
                    { name: { in: STATUS_MESSAGE } },
                    { name: "Comp Oil Pres" },
                    { name: "External DC Voltage" }
                ]
            }
        })

        let grouped = groupBy(allParameters, i => i.unitNumber)

        let result: Array<UnitStatus> = []

        Object.entries(grouped).forEach(([key, value]) => {
            let unitStatus: UnitStatus = { unitNumber: key } as UnitStatus

            if (OIL_PRES_UNITS.includes(key)) {
                if (Number(value.find(i => i.name === "Comp Oil Pres")!.value) >= 40) {
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
                    if (Number(value.find(i => RPM.includes(i.name))!.value) > 0) {
                        unitStatus.status = "Running"
                    } else {
                        unitStatus.status = "Stopped"
                    }
                }
            }

            const message = value.find(i => STATUS_MESSAGE.includes(i.name))
            unitStatus.statusMessage = message ? message.value! : ""

            const rpm = value.find(i => RPM.includes(i.name))
            unitStatus.timestamp = rpm!.timestamp!

            result.push(unitStatus)
        })

        return result
    })

    // Get all parameters for a single unit by unit number
    fastify.get<{ Params: { unitNum: string } }>("/:unitNum", async (req, res) => {
        const unitParameters = await prisma.parameter.findMany({
            where: {
                unitNumber: req.params.unitNum
            }
        })

        return unitParameters
    })
}

export default routes