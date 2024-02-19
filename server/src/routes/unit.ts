import { FastifyInstance } from "fastify"
import { getAllUnits, getAllCustomers, getAllRegions, getUnit } from "../api/unit"

async function routes(fastify: FastifyInstance) {
    // Get all units
    fastify.get("/", async (req, res) => {
        const allUnits = await getAllUnits()

        res.status(200).send(allUnits)
    })

    // Get single unit by unit number
    fastify.get<{ Params: { unitNum: string } }>("/:unitNum", async (req, res) => {
        const { unitNum } = req.params

        const unit = await getUnit(unitNum)

        if (unit) {
            res.status(200).send(unit)
        } else {
            res.status(404).send({ error: `Unit ${req.params.unitNum} not found.` })
        }
    })

    // Get list of customers
    fastify.get("/customer", async (req, res) => {
        const customers = await getAllCustomers()

        res.status(200).send(customers)
    })

    // Get list of regions
    fastify.get("/region", async (req, res) => {
        const regions = await getAllRegions()

        res.status(200).send(regions)
    })
}

export default routes