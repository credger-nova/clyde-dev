import { FastifyInstance, FastifyRequest } from "fastify"
import { generateSignedURL, getFileStream, softDeleteFile, uploadFile } from "../api/storage"
import dotenv from "dotenv"

dotenv.config()

async function routes(fastify: FastifyInstance) {
    // Upload files to given location
    fastify.post("/", async (req, res) => {
        const data = await req.file()
        const buffer = await data?.toBuffer()

        if (data) {
            const uploadedFile = await uploadFile(
                process.env.STORAGE_BUCKET ?? "",
                `${(data.fields as any).folder.value}/${data.filename}`,
                buffer
            )
            return uploadedFile
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

    // Get a stream from a given file
    fastify.get<{ Params: { bucket: string, fileName: string } }>("/download/:bucket/:fileName", async (req, res) => {
        const { bucket, fileName } = req.params

        const fileStream = getFileStream(bucket, fileName)

        return fileStream
    })

    // Delete a file
    fastify.delete("/:id", async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        const { id } = req.params

        const updatedFile = await softDeleteFile(id)

        return updatedFile
    })
}

export default routes