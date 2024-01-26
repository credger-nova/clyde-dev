import { FastifyInstance, FastifyRequest } from "fastify"
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

        return allUnits
    })

    // Get single unit by unit number
    fastify.get<{ Params: { unitNum: string } }>("/:unitNum", async (req, res) => {
        const unit = await prisma.unit.findUnique({
            where: {
                unitNumber: req.params.unitNum
            }
        })

        return unit
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

        return customers
    })
}

export default routes