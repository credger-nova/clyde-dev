import { FastifyInstance, FastifyRequest } from "fastify"
import { prisma } from "../prisma-client"

async function routes(fastify: FastifyInstance) {
    // Default route
    fastify.get("/", async (req, res) => {
        const allUnits = await prisma.unit.findMany()

        return allUnits
    })
}

export default routes