import { FastifyInstance, FastifyRequest } from "fastify"
import { prisma } from "../prisma-client"

async function routes(fastify: FastifyInstance) {
    // Get all unit parameters
    fastify.get("/", async (req, res) => {
        const allParameters = await prisma.parameter.findMany()

        return allParameters
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