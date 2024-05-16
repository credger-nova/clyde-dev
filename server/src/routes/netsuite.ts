import { FastifyInstance, FastifyRequest } from "fastify"
import { getAllVendors } from "../api/netsuite/vendor"
import { getAllLocations } from "../api/netsuite/location"
import { getAllSalesOrders } from "../api/netsuite/sales-order"
import { getAllTrucks } from "../api/netsuite/truck"
import { getAllParts } from "../api/netsuite/part"

async function routes(fastify: FastifyInstance) {
    // Route to get all items
    fastify.get("/parts", async (req: FastifyRequest<{ Querystring: { inactive: "true" } }>, res) => {
        const { inactive } = req.query

        const parts = await getAllParts(inactive)

        res.status(200).send(parts)
    })

    // Route to get trucks
    fastify.get("/trucks", async (req, res) => {
        const trucks = await getAllTrucks()

        res.status(200).send(trucks)
    })

    // Route to get SO #s
    fastify.get("/sales-orders", async (req: FastifyRequest<{ Querystring: { inactive: "true" } }>, res) => {
        const { inactive } = req.query

        const salesOrders = await getAllSalesOrders(inactive)

        res.status(200).send(salesOrders)
    })

    // Route to get Locations
    fastify.get("/locations", async (req, res) => {
        const locations = await getAllLocations()

        res.status(200).send(locations)
    })

    // Route to get Vendors
    fastify.get("/vendors", async (req: FastifyRequest<{ Querystring: { inactive: "true" } }>, res) => {
        const { inactive } = req.query

        const vendors = await getAllVendors(inactive)

        res.status(200).send(vendors)
    })
}

export default routes