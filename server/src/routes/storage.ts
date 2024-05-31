import { FastifyInstance } from "fastify"
import { generateSignedURL, uploadFile } from "../api/storage"
import dotenv from "dotenv"

dotenv.config()

async function routes(fastify: FastifyInstance) {
    // Upload files to given location
    fastify.post("/", async (req, res) => {
        const data = await req.file({ limits: { fileSize: 50 * 1024 * 1024 } }) // 50MB
        const buffer = await data?.toBuffer()

        if (data) {
            await uploadFile((data.fields as any).bucket.value, `${(data.fields as any).folder.value}/${data.filename}`, buffer)

            res.status(204)
        } else {
            res.status(400).send({ data: "Missing File" })
        }
    })

    // Get a signed URL for a given file
    fastify.get<{ Params: { bucket: string; fileName: string } }>("/:bucket/:fileName", async (req, res) => {
        const { bucket, fileName } = req.params

        const signedURL = await generateSignedURL(bucket, fileName)

        res.status(200).send({ signedURL })
    })
}

export default routes
