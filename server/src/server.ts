import Fastify from "fastify"
import cors from "@fastify/cors"
import multipart from "@fastify/multipart"
import fastifyAuth0Verify from "fastify-auth0-verify"
import qs from "qs"
import dotenv from "dotenv"

dotenv.config()

const fastify = Fastify({
    querystringParser: (str) => qs.parse(str),
    logger: true,
})

const createServer = async () => {
    await fastify.register(cors)
    await fastify.register(multipart)
    await fastify.register(fastifyAuth0Verify, {
        domain: process.env.AUTH0_DOMAIN,
        audience: process.env.AUTH0_AUDIENCE,
        secret: process.env.AUTH0_CLIENT_SECRET,
    })

    // Only need to verify JWT on deployed environments
    if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test") {
        fastify.addHook("onRequest", async (req, res) => {
            try {
                await req.jwtVerify()
            } catch (err) {
                res.send(err)
            }
        })
    }

    await fastify.register(require("./routes/unit"), { prefix: "unit" })
    await fastify.register(require("./routes/parameter"), { prefix: "parameter" })
    await fastify.register(require("./routes/netsuite"), { prefix: "netsuite" })
    await fastify.register(require("./routes/kpa"), { prefix: "kpa" })
    await fastify.register(require("./routes/forms"), { prefix: "forms" })
    await fastify.register(require("./routes/storage"), { prefix: "storage" })

    fastify.setErrorHandler((error, req, res) => {
        req.log.error(error.toString())
        res.send({ error })
    })

    return fastify
}

export default createServer
