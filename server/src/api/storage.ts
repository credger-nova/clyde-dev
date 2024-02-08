import { File } from "@prisma/client"
import { prisma } from "../utils/prisma-client"
import { storage } from "../utils/gcp-storage"

export const uploadFiles = async (bucket: string, folder: string, files: Array<File>) => {
    for (const file of files) {
        await storage
            .bucket(bucket)
            .upload(`${folder}/${file.id}.${file.id.split(".").pop()}`)
    }
}

export const generateSignedURL = async (bucket: string, fileName: string) => {
    const [signedURL] = await storage
        .bucket(bucket)
        .file(fileName)
        .getSignedUrl({
            action: "read",
            expires: Date.now() + (1000 * 60) // 1 minute
        })

    return signedURL
}

export const getFileStream = (bucket: string, fileName: string) => {
    const fileStream = storage
        .bucket(bucket)
        .file(fileName)
        .createReadStream()

    return fileStream
}

export const softDeleteFile = async (id: string) => {
    const deletedFile = await prisma.file.update({
        where: {
            id: id
        },
        data: {
            isDeleted: true
        }
    })

    return deletedFile
}