import { FastifyInstance } from "fastify";
import getNsAccessJwt from "../utils/netsuite/get-ns-access-jwt";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const ENV = process.env.NODE_ENV

async function routes(fastify: FastifyInstance) {
    // Route to get all items
    fastify.get("/items", async (req, res) => {
        const jwt = await getNsAccessJwt()

        const { data } = await axios.get(`${ENV === "prod" ? process.env.PROD_NS_RESTLET_BASE :
            process.env.DEV_NS_RESTLET_BASE}script=${ENV === "prod" ? process.env.PROD_NS_ITEMS_RESTLET :
                process.env.DEV_NS_ITEMS_RESTLET}&deploy=1`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt.access_token}`
                }
            })

        return data
    })

    // Route to get trucks
    fastify.get("/trucks", async (req, res) => {
        const jwt = await getNsAccessJwt()

        const { data } = await axios.get(`${ENV === "prod" ? process.env.PROD_NS_RESTLET_BASE :
            process.env.DEV_NS_RESTLET_BASE}script=${ENV === "prod" ? process.env.PROD_NS_TRUCKS_RESTLET :
                process.env.DEV_NS_TRUCKS_RESTLET}&deploy=1`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt.access_token}`
                }
            })

        return data
    })

    // Route to get SO #s
    fastify.get("/sales-orders", async (req, res) => {
        const jwt = await getNsAccessJwt()

        const { data } = await axios.get(`${ENV === "prod" ? process.env.PROD_NS_RESTLET_BASE :
            process.env.DEV_NS_RESTLET_BASE}script=${ENV === "prod" ? process.env.PROD_NS_SO_RESTLET :
                process.env.DEV_NS_SO_RESTLET}&deploy=1`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt.access_token}`
                }
            })

        return data
    })
}

export default routes