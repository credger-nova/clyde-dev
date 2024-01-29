import server from "./server"
import dotenv from "dotenv"

dotenv.config()

const PORT = Number(process.env.PORT)

async function start() {
    const fastify = await server()

    fastify.listen({ port: PORT || 5000, host: "0.0.0.0" }, function (err, address) {
        if (err) {
            fastify.log.error(err)
            process.exit(1)
        } else {
            fastify.log.info(`Fastify server listening on port ${address}`)
        }
    })
}

start()