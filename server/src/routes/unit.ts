import { FastifyInstance } from "fastify"
import { prisma } from "../utils/prisma-client"

async function routes(fastify: FastifyInstance) {
    // Get all units
    fastify.get("/", async (req, res) => {
        const allUnits = await prisma.unit.findMany({
            orderBy: [
                {
                    unitNumber: "asc"
                }
            ]
        })

        res.status(200).send(allUnits)
    })

    // Get single unit by unit number
    fastify.get<{ Params: { unitNum: string } }>("/:unitNum", async (req, res) => {
        const unit = await prisma.unit.findUnique({
            where: {
                unitNumber: req.params.unitNum
            }
        })

        if (unit) {
            res.status(200).send(unit)
        } else {
            res.status(404).send({ error: `Unit ${req.params.unitNum} not found.` })
        }
    })

    // Get list of customers
    fastify.get("/customer", async (req, res) => {
        const allUnits = await prisma.unit.findMany({
            distinct: ["customer"],
            select: {
                customer: true
            }
        })

        const customers = allUnits
            .map(item => item.customer)
            .filter(item => item)
            .sort()

        res.status(200).send(customers)
    })

    // Get list of regions
    fastify.get("/region", async (req, res) => {
        const allUnits = await prisma.unit.findMany({
            distinct: ["operationalRegion"],
            select: {
                operationalRegion: true
            }
        })

        const regions = allUnits
            .map(item => item.operationalRegion)
            .filter(item => item)
            .sort()

        res.status(200).send(regions)
    })
}

export default routes