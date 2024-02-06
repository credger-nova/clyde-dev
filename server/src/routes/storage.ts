import { FastifyInstance, FastifyRequest } from "fastify"
import { generateSignedURL } from "../api/storage"
import dotenv from "dotenv"

dotenv.config()

async function routes(fastify: FastifyInstance) {
    // Get signed URL for given resource
    fastify.post("/download", async (req: FastifyRequest<{ Body: { bucket: string, fileName: string } }>, res) => {
        const { bucket, fileName } = req.body

        const signedURL = await generateSignedURL(bucket, fileName)

        return signedURL
    })
}

export default routes