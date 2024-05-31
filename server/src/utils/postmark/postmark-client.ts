import { ServerClient } from "postmark"
import dotenv from "dotenv"

dotenv.config()

const globalForPostMark = globalThis as unknown as { postmarkClient: ServerClient }

export const postmarkClient = globalForPostMark.postmarkClient || new ServerClient(process.env.POSTMARK_SERVER_TOKEN!)

if (process.env.NODE_ENV !== "production") {
    globalForPostMark.postmarkClient = postmarkClient
}
