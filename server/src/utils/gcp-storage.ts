import { Storage } from "@google-cloud/storage"
import dotenv from "dotenv"

dotenv.config()

const SVC_NOVA_CREDENTIALS = JSON.parse(process.env.SVC_NOVA_CREDENTIALS ?? "")

const globalForStorage = globalThis as unknown as { storage: Storage }

export const storage = globalForStorage.storage || new Storage({ credentials: SVC_NOVA_CREDENTIALS })
