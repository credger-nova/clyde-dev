import { Storage } from "@google-cloud/storage"
import { File } from "@prisma/client"
import dotenv from "dotenv"
import * as fs from "fs"

dotenv.config()

const SVC_NOVA_CREDENTIALS = JSON.parse(process.env.SVC_NOVA_CREDENTIALS ?? "")

const globalForStorage = globalThis as unknown as { storage: Storage }

export const storage = globalForStorage.storage || new Storage({ credentials: SVC_NOVA_CREDENTIALS })

export async function uploadFiles(files: Array<File>, bucket: string, folder: string) {
    for (const file of files) {
        const options = {
            destination: `${folder}/${file.id}.${file.name.split(".").pop()}`
        }

        await storage.bucket(bucket).upload(file.name, options)
    }
}

export async function downloadFile(bucket: string, fileName: string, destFileName: string) {
    const fromBucket = storage.bucket(bucket)
    const remoteFile = fromBucket.file(fileName)

    remoteFile.createReadStream()
        .on("error", function (err) { })
        .on("end", function () { })
        .pipe(fs.createWriteStream(destFileName))
}