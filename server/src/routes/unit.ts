import { FastifyInstance, FastifyRequest } from "fastify"
import { prisma } from "../prisma-client"

async function routes(fastify: FastifyInstance) {
    // Get all units
    fastify.get("/", async (req, res) => {
        const allUnits = await prisma.unit.findMany()

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
}

export default routes