import { FastifyInstance } from "fastify";
import getNsAccessJwt from "../utils/netsuite/get-ns-access-jwt";
import axios from "axios";
import dotenv from "dotenv";
import { Part, NetsuitePart } from "../models/part";

dotenv.config();

async function routes(fastify: FastifyInstance) {
    // Route to get all items
    fastify.get("/items", async (req, res) => {
        const jwt = await getNsAccessJwt()

        const { data } = await axios.get<Array<NetsuitePart>>(`${process.env.NS_RESTLET_BASE}script=${process.env.NS_ITEMS_RESTLET}&deploy=1`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt.access_token}`
                }
            })

        const parts = data.map(part => {
            return {
                id: part.id,
                itemNumber: part.values.itemid,
                description: part.values.salesdescription,
                cost: part.values.cost
            } as Part
        })

        res.status(200).send(parts)
    })

    // Route to get trucks
    fastify.get("/trucks", async (req, res) => {
        const jwt = await getNsAccessJwt()

        const { data } = await axios.get<Array<string>>(`${process.env.NS_RESTLET_BASE}script=${process.env.NS_TRUCKS_RESTLET}&deploy=1`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt.access_token} `
                }
            })

        res.status(200).send(data)
    })

    // Route to get SO #s
    fastify.get("/sales-orders", async (req, res) => {
        const jwt = await getNsAccessJwt()

        const { data } = await axios.get<Array<string>>(`${process.env.NS_RESTLET_BASE}script=${process.env.NS_SO_RESTLET}&deploy=1`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt.access_token} `
                }
            })

        res.status(200).send(data)
    })

    // Route to get Locations
    fastify.get("/locations", async (req, res) => {
        const jwt = await getNsAccessJwt()

        const { data } = await axios.get<Array<string>>(`${process.env.NS_RESTLET_BASE}script=${process.env.NS_LOCATIONS_RESTLET}&deploy=1`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt.access_token} `
                }
            })

        res.status(200).send(data)
    })
}

export default routes