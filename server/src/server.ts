import Fastify from "fastify"
import cors from "@fastify/cors"
import qs from "qs"

const fastify = Fastify({ querystringParser: str => qs.parse(str), logger: true })

const createServer = async () => {
    await fastify.register(cors)

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