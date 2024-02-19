import { FastifyInstance } from "fastify"
import { getAllItems, getAllLocations, getAllSalesOrders, getAllTrucks } from "../api/netsuite"

async function routes(fastify: FastifyInstance) {
    // Route to get all items
    fastify.get("/items", async (req, res) => {
        const parts = await getAllItems()

        res.status(200).send(parts)
    })

    // Route to get trucks
    fastify.get("/trucks", async (req, res) => {
        const trucks = await getAllTrucks()

        res.status(200).send(trucks)
    })

    // Route to get SO #s
    fastify.get("/sales-orders", async (req, res) => {
        const soNums = await getAllSalesOrders()

        res.status(200).send(soNums)
    })

    // Route to get Locations
    fastify.get("/locations", async (req, res) => {
        const locations = await getAllLocations()

        res.status(200).send(locations)
    })
}

export default routes