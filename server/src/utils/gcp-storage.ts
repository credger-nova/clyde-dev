import { Storage } from "@google-cloud/storage"
import { File } from "@prisma/client"
import dotenv from "dotenv"
import * as fs from "fs"

dotenv.config()

const SVC_NOVA_CREDENTIALS = JSON.parse(process.env.SVC_NOVA_CREDENTIALS ?? "")

const globalForStorage = globalThis as unknown as { storage: Storage }

export const storage = globalForStorage.storage || new Storage({ credentials: SVC_NOVA_CREDENTIALS })