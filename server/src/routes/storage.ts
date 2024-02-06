import { FastifyInstance, FastifyRequest } from "fastify"
import { storage } from "../utils/gcp-storage"
import dotenv from "dotenv"
import { File } from "@prisma/client"

dotenv.config()

interface UploadFiles {
    files: Array<File>,
}

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

    // Upload files to Cloud Storage
    fastify.post("/", async (req: FastifyRequest<{ Body: UploadFiles }>, res) => {
        const { files } = req.body

        for (const file of files) {
            const options = {
                destination: file.id
            }

            await storage.bucket(file.bucket).upload(file.name, options)
        }
    })
}

export default routes