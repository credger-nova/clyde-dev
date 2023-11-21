import { FastifyInstance, FastifyRequest } from "fastify"
import { prisma } from "../prisma-client"

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