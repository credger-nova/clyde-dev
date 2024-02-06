import { Storage } from "@google-cloud/storage"
import { File } from "@prisma/client"
import dotenv from "dotenv"

dotenv.config()

const SVC_NOVA_CREDENTIALS = JSON.parse(process.env.SVC_NOVA_CREDENTIALS ?? "")

const globalForStorage = globalThis as unknown as { storage: Storage }

export const storage = globalForStorage.storage || new Storage({ credentials: SVC_NOVA_CREDENTIALS })

export async function uploadFiles(files: Array<File>) {
    for (const file of files) {
        const options = {
            destination: `${file.id}.${file.name.split(".").pop()}`
        }

        await storage.bucket(file.bucket).upload(file.name, options)
    }
}