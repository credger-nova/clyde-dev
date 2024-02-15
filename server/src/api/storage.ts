import { prisma } from "../utils/prisma-client"
import { storage } from "../utils/gcp-storage"

export const uploadFile = async (bucket: string, fileName: string, file: Buffer | undefined) => {
    if (file) {
        await storage
            .bucket(bucket)
            .file(fileName)
            .save(file!)
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