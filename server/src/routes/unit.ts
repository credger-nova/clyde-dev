import { FastifyInstance, FastifyRequest } from "fastify"
import {
    getAllUnits, getAllCustomers, getAllLocations, getAllRegions, getUnit, generateUnitsLayer,
    getAllManagers, getCentroid
} from "../api/unit"
import { GeoJSONFeature } from "../models/geoJson"

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
    fastify.get("/location", async (req, res) => {
        const locations = await getAllLocations()

        res.status(200).send(locations)
    })

    // Get list of regions
    fastify.get("/region", async (req, res) => {
        const regions = await getAllRegions()

        res.status(200).send(regions)
    })

    // Get list of managers
    fastify.get("/manager", async (req, res) => {
        const managers = await getAllManagers()

        res.status(200).send(managers)
    })

    // Get GeoJSON layer for units
    fastify.get<{ Params: { manager: string | undefined } }>("/geojson/:manager", async (req, res) => {
        const { manager } = req.params

        const layer = await generateUnitsLayer(manager)

        res.status(200).send(layer)
    })

    // Get centroid for GeoJSON layer
    fastify.post("/geojson/centroid", async (req: FastifyRequest<{ Body: { features: Array<GeoJSONFeature> } }>, res) => {
        const { features } = req.body

        const centroid = getCentroid(features)

        return centroid
    })
}

export default routes