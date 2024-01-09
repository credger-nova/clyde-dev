import { FastifyInstance, FastifyRequest } from "fastify"
import { prisma } from "../utils/prisma-client"
import { PartsReq } from "../models/partsReq"

async function routes(fastify: FastifyInstance) {
    // Get all Parts Reqs
    fastify.get("/parts-req", async (req, res) => {
        const partsReqs = await prisma.partsReq.findMany({
            include: {
                parts: true
            }
        })

        return partsReqs
    })

    // Get single Parts Req by id
    fastify.get<{ Params: { id: number } }>("/parts-req/:id", async (req, res) => {
        const partsReq = await prisma.partsReq.findUnique({
            where: {
                id: Number(req.params.id)
            },
            include: {
                parts: true
            }
        })

        return partsReq
    })

    // Create a Parts Req form
    fastify.post("/parts-req", async (req: FastifyRequest<{ Body: PartsReq }>, res) => {
        // Ensure no invalid rows are created
        req.body.parts = req.body.parts.filter(row => row.itemNumber !== "")

        const partsReq = await prisma.partsReq.create({
            data: {
                requester: req.body.requester,
                date: req.body.date,
                afe: req.body.class.afe,
                so: req.body.class.so,
                unitNumber: req.body.relAsset.unit?.unitNumber,
                truck: req.body.relAsset.truck,
                urgency: req.body.urgency,
                orderType: req.body.orderType,
                region: req.body.region,
                parts: {
                    createMany: {
                        data: req.body.parts
                    }
                },
                status: req.body.status,
                updated: req.body.updated
            }
        })

        res.status(201)
        return partsReq
    })
}


export default routes