import { File } from "@prisma/client"
import { storage } from "../utils/gcp-storage"

export const uploadFiles = async (bucket: string, folder: string, files: Array<File>) => {
    for (const file of files) {
        await storage
            .bucket(bucket)
            .upload(`${folder}/${file.id}.${file.id.split(".").pop()}`)
    }
}

export const downloadFile = async (bucket: string, fileName: string, destination: string) => {
    await storage
        .bucket(bucket)
        .file(fileName)
        .download({
            destination: destination
        })
}