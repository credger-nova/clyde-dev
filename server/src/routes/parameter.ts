import { FastifyInstance, FastifyRequest } from "fastify"
import { prisma } from "../prisma-client"

async function routes(fastify: FastifyInstance) {
    // Default route
    fastify.get("/", async (req, res) => {
        const allParameters = await prisma.parameter.findMany()

        return allParameters
    })
}

export default routes