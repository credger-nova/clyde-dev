import { FastifyInstance, FastifyRequest } from "fastify"
import { prisma } from "../utils/prisma-client"
import { UnitStatus } from "../models/unit"
import { getAllParameters, getParameters, getStatus } from "../api/parameter"

async function routes(fastify: FastifyInstance) {
    // Get all unit parameters
    fastify.get("/", async (req, res) => {
        const parameters = await getAllParameters()

        res.status(200).send(parameters)
    })

    // Get trimmed version of unit parameters suited for unit status page
    fastify.get("/status", async (req, res) => {
        const status = await getStatus()

        res.status(200).send(status)
    })

    // Get all parameters for a single unit by unit number
    fastify.get<{ Params: { unitNum: string } }>("/:unitNum", async (req, res) => {
        const { unitNum } = req.params

        const unitParameters = await getParameters(unitNum)

        if (unitParameters) {
            res.status(200).send(unitParameters)
        } else {
            res.status(404).send({ error: `No parameters found for ${req.params.unitNum}.` })
        }
    })
}

export default routes
