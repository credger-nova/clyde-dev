import { FastifyInstance, FastifyRequest } from "fastify"
import { generateSignedURL, softDeleteFile, uploadFile } from "../api/storage"
import dotenv from "dotenv"

dotenv.config()

async function routes(fastify: FastifyInstance) {
    // Upload files to given location
    fastify.post("/", async (req, res) => {
        const data = await req.file()
        const buffer = await data?.toBuffer()

        if (data) {
            await uploadFile(
                (data.fields as any).bucket.value,
                `${(data.fields as any).folder.value}/${data.filename}`,
                buffer
            )

            res.status(200)
        } else {
            return "Error"
        }
    })

    // Get a signed URL for a given file
    fastify.get<{ Params: { bucket: string, fileName: string } }>("/:bucket/:fileName", async (req, res) => {
        const { bucket, fileName } = req.params

        const signedURL = await generateSignedURL(bucket, fileName)

        return signedURL
    })

    // Delete a file
    fastify.delete("/:id", async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        const { id } = req.params

        const updatedFile = await softDeleteFile(id)

        return updatedFile
    })
}

export default routes