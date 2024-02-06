import { FastifyInstance, FastifyRequest } from "fastify"
import { storage } from "../utils/gcp-storage"
import { downloadFile } from "../api/storage"
import dotenv from "dotenv"

dotenv.config()

async function routes(fastify: FastifyInstance) {
    // List available storage buckets
    fastify.get("/buckets", async (req, res) => {
        const [buckets] = await storage.getBuckets()

        return buckets.map((bucket) => bucket.name)
    })

    // List files in given bucket
    fastify.get<{ Params: { bucket: string } }>("/files/:bucket", async (req, res) => {
        const [files] = await storage.bucket(req.params.bucket).getFiles()

        return files.map((file) => file.name)
    })

    // Download file at given location
    fastify.post("/download", async (req: FastifyRequest<{ Body: { bucket: string, fileName: string, destFileName: string } }>, res) => {
        const { bucket, fileName, destFileName } = req.body

        await downloadFile(bucket, fileName, destFileName)
    })
}

export default routes