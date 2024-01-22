import { FastifyInstance, FastifyRequest } from "fastify"
import { prisma } from "../utils/prisma-client"
import { PartsReq, UpdatePartsReq } from "../models/partsReq"

async function routes(fastify: FastifyInstance) {
    // Get all Parts Reqs
    fastify.get("/parts-req", async (req: FastifyRequest<{
        Querystring: {
            searchString?: string,
            id?: string,
            afe?: string,
            so?: string,
            unitNumber?: string,
            truck?: string,
            part?: string,
            requester?: string,
            customer?: string,
            urgency?: string
        }
    }>, res) => {
        const {
            searchString,
            afe,
            so,
            unitNumber,
            truck,
            part, // TODO
            requester,
            customer, // TODO
            urgency
        } = req.query

        const result = await prisma.partsReq.findMany({
            where: searchString ? {
                OR: [
                    {
                        afe: {
                            contains: searchString, mode: "insensitive"
                        }
                    },
                    {
                        so: {
                            contains: searchString, mode: "insensitive"
                        }
                    },
                    {
                        unitNumber: {
                            contains: searchString, mode: "insensitive"
                        }
                    },
                    {
                        truck: {
                            contains: searchString, mode: "insensitive"
                        }
                    },
                    {
                        requester: {
                            contains: searchString, mode: "insensitive"
                        }
                    },
                    {
                        unit: {
                            customer: {
                                contains: searchString, mode: "insensitive"
                            }
                        }
                    }
                ]
                /*AND: [{
                    AND: [
                        afe ? { afe: afe } : {},
                        so ? { so: so } : {},
                        unitNumber ? { unitNumber: unitNumber } : {},
                        truck ? { truck: truck } : {},
                        requester ? { requester: requester } : {},
                        urgency ? { urgency: urgency } : {}
                    ]
                },
                {
                    OR: [
                        { id: Number(searchString) },
                        { afe: { contains: searchString } },
                        { so: { contains: searchString } },
                        { unitNumber: { contains: searchString } },
                        { truck: { contains: searchString } },
                        { requester: { contains: searchString } },
                        { unit: { customer: { contains: searchString?.toUpperCase() } } }
                    ]
                }]*/
            } : {},
            include: {
                parts: true,
                comments: true,
                unit: true
            }
        })

        const partsReqs = result.map((obj) => {
            return (
                {
                    id: obj.id,
                    requester: obj.requester,
                    date: obj.date,
                    class: {
                        afe: obj.afe,
                        so: obj.so
                    },
                    relAsset: {
                        unit: obj.unit,
                        truck: obj.truck
                    },
                    urgency: obj.urgency,
                    orderType: obj.orderType,
                    region: obj.region,
                    parts: obj.parts,
                    comments: obj.comments,
                    status: obj.status,
                    updated: obj.updated
                } as PartsReq
            )
        })

        return partsReqs
    })

    // Get single Parts Req by id
    fastify.get<{ Params: { id: string } }>("/parts-req/:id", async (req, res) => {
        const result = await prisma.partsReq.findUnique({
            where: {
                id: Number(req.params.id)
            },
            include: {
                parts: true,
                comments: true,
                unit: true
            }
        })

        let partsReq
        if (result) {
            partsReq = {
                id: result.id,
                requester: result.requester,
                date: result.date,
                class: {
                    afe: result.afe,
                    so: result.so
                },
                relAsset: {
                    unit: result.unit,
                    truck: result.truck
                },
                urgency: result.urgency,
                orderType: result.orderType,
                region: result.region,
                parts: result.parts,
                comments: result.comments,
                status: result.status,
                updated: result.updated
            } as PartsReq
        } else {
            partsReq = null
        }

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
                comments: {
                    createMany: {
                        data: req.body.comments
                    }
                },
                status: req.body.status,
                updated: req.body.updated
            }
        })

        res.status(201)
        return partsReq
    })

    // Update a Parts Req form
    fastify.put("/parts-req/:id", async (req: FastifyRequest<{ Params: { id: string }, Body: Partial<UpdatePartsReq> }>, res) => {
        // Ensure no invalid rows are created
        const existingParts = req.body.parts ? req.body.parts.filter(row => (row.itemNumber !== "" && row.id)) : []
        const newParts = req.body.parts ? req.body.parts.filter(row => (!row.id)) : []

        // Update existing parts rows
        for (const part of existingParts) {
            await prisma.partsReqRow.update({
                where: {
                    id: part.id
                },
                data: {
                    qty: part.qty,
                    itemNumber: part.itemNumber,
                    description: part.description
                }
            })
        }

        // Add new parts rows
        for (const part of newParts) {
            await prisma.partsReqRow.create({
                data: {
                    qty: part.qty,
                    itemNumber: part.itemNumber,
                    description: part.description,
                    partsReqId: Number(req.params.id)
                }
            })
        }

        // Delete parts rows
        if (req.body.delRows) {
            for (const row of req.body.delRows) {
                await prisma.partsReqRow.delete({
                    where: {
                        id: row.id
                    }
                })
            }
        }

        // Add new comments
        if (req.body.comments) {
            for (const comment of req.body.comments) {
                if (!comment.id) {
                    await prisma.comment.create({
                        data: {
                            comment: comment.comment,
                            name: comment.name,
                            timestamp: comment.timestamp,
                            partsReqId: Number(req.params.id)
                        }
                    })
                }
            }
        }

        // Update parts req fields
        const updatedPartsReq = await prisma.partsReq.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                afe: req.body.class?.afe,
                so: req.body.class?.so,
                unitNumber: req.body.relAsset?.unit?.unitNumber,
                truck: req.body.relAsset?.truck,
                urgency: req.body.urgency,
                orderType: req.body.orderType,
                region: req.body.region,
                status: req.body.status,
                updated: new Date().toISOString()
            }
        })

        res.status(200)
        return (updatedPartsReq)
    })
}


export default routes