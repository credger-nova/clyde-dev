import Fastify from "fastify"
import qs from "qs"
import dotenv from "dotenv"

dotenv.config()

const fastify = Fastify({ querystringParser: str => qs.parse(str), logger: true })

const createServer = async () => {
    await fastify.register(require("./routes/unit"), { prefix: "unit" })
    await fastify.register(require("./routes/parameter"), { prefix: "parameter" })

    fastify.setErrorHandler((error, req, res) => {
        req.log.error(error.toString())
        res.send({ error })
    })

    return fastify
}

export default createServer