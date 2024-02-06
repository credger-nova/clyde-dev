import { FastifyInstance, FastifyRequest } from "fastify"
import { prisma } from "../utils/prisma-client"
import { PartsReq, UpdatePartsReq } from "../models/partsReq"
import axios from "axios"
import { uploadFiles } from "../utils/gcp-storage"

const URGENCY_SORT = ["Unit Down", "Rush", "Standard", "Stock"]

async function genSystemComment(message: string, user: string, id: number) {
    await prisma.comment.create({
        data: {
            comment: message,
            name: user,
            timestamp: new Date().toISOString(),
            partsReqId: id
        }
    })
}

interface PartsReqQuery {
    searchString?: string,
    id?: string,
    afe?: Array<string>,
    so?: Array<string>,
    unitNumber?: Array<string>,
    truck?: Array<string>,
    part?: Array<string>,
    requester?: Array<string>,
    customer?: Array<string>,
    urgency?: Array<string>,
    status?: Array<string>
}

async function routes(fastify: FastifyInstance) {
    // POST request to get Parts Reqs with requirements defined in body
    fastify.post("/parts-req", async (req: FastifyRequest<{ Body: PartsReqQuery }>, res) => {

        const result = await prisma.partsReq.findMany({
            where: {
                AND: [
                    {
                        AND: [
                            req.body.afe && req.body.afe.length > 0 ? { afe: { in: req.body.afe } } : {},
                            req.body.so && req.body.so.length > 0 ? { so: { in: req.body.so } } : {},
                            req.body.unitNumber && req.body.unitNumber.length > 0 ? { unitNumber: { in: req.body.unitNumber } } : {},
                            req.body.truck && req.body.truck.length > 0 ? { truck: { in: req.body.truck } } : {},
                            {}, // TODO: parts
                            req.body.requester && req.body.requester.length > 0 ? { requester: { in: req.body.requester } } : {},
                            req.body.customer && req.body.customer.length > 0 ? { unit: { customer: { in: req.body.customer } } } : {},
                            req.body.urgency && req.body.urgency.length > 0 ? { urgency: { in: req.body.urgency } } : {},
                            req.body.status && req.body.status.length > 0 ? { status: { in: req.body.status } } : {}
                        ]
                    },
                    {
                        OR: [
                            { id: Number(req.body.searchString) ? { in: req.body.searchString ? [Number(req.body.searchString)] : [] } : {} },
                            { afe: { contains: req.body.searchString ?? "", mode: "insensitive" } },
                            { so: { contains: req.body.searchString ?? "", mode: "insensitive" } },
                            { unitNumber: { contains: req.body.searchString ?? "", mode: "insensitive" } },
                            { truck: { contains: req.body.searchString ?? "", mode: "insensitive" } },
                            { requester: { contains: req.body.searchString ?? "", mode: "insensitive" } },
                            { unit: { customer: { contains: req.body.searchString ?? "", mode: "insensitive" } } }
                        ]
                    }
                ]
            },
            include: {
                parts: true,
                comments: true,
                unit: true,
                files: true
            }
        })

        const partsReqs = result.map((obj) => {
            return (
                {
                    id: obj.id,
                    requester: obj.requester,
                    contact: obj.contact,
                    date: obj.date,
                    afe: obj.afe,
                    so: obj.so,
                    unit: obj.unit,
                    truck: obj.truck,
                    urgency: obj.urgency,
                    orderType: obj.orderType,
                    pickup: obj.pickup,
                    region: obj.region,
                    parts: obj.parts,
                    comments: obj.comments,
                    files: obj.files,
                    status: obj.status,
                    updated: obj.updated
                } as PartsReq
            )
        })

        // Sort by Urgency and Date
        partsReqs.sort((a, b) => URGENCY_SORT.indexOf(a.urgency) - URGENCY_SORT.indexOf(b.urgency) || a.date.getTime() - b.date.getTime())

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
                unit: true,
                files: true
            }
        })

        let partsReq
        if (result) {
            partsReq = {
                id: result.id,
                requester: result.requester,
                contact: result.contact,
                date: result.date,
                afe: result.afe,
                so: result.so,
                unit: result.unit,
                truck: result.truck,
                urgency: result.urgency,
                orderType: result.orderType,
                pickup: result.pickup,
                region: result.region,
                parts: result.parts,
                comments: result.comments,
                files: result.files,
                status: result.status,
                updated: result.updated
            } as PartsReq
        } else {
            partsReq = null
        }

        return partsReq
    })

    // Create a Parts Req form
    fastify.post("/parts-req/create", async (req: FastifyRequest<{ Body: PartsReq }>, res) => {
        // Ensure no invalid rows are created
        req.body.parts = req.body.parts.filter(row => row.itemNumber !== "")

        const partsReq = await prisma.partsReq.create({
            data: {
                requester: req.body.requester,
                date: req.body.date,
                afe: req.body.afe,
                so: req.body.so,
                unitNumber: req.body.unit ? req.body.unit.unitNumber : null,
                truck: req.body.truck,
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
                files: {
                    createMany: {
                        data: req.body.files.map((file) => {
                            return {
                                name: file.name,
                                bucket: file.bucket
                            }
                        })
                    }
                },
                status: req.body.status,
                updated: req.body.updated
            }
        })

        const newFiles = await prisma.file.findMany({
            where: {
                partsReqId: partsReq.id
            }
        })

        if (newFiles.length > 0) {
            await uploadFiles(newFiles)
        }

        res.status(201)
        return partsReq
    })

    // Update a Parts Req form
    fastify.put("/parts-req/:id", async (req: FastifyRequest<{ Params: { id: string }, Body: { user: string, updateReq: Partial<UpdatePartsReq> } }>, res) => {
        const { user, updateReq } = req.body

        // Get existing version of the Parts Req for comment generation
        const oldPartsReq = await prisma.partsReq.findUnique({
            where: {
                id: Number(req.params.id)
            }
        })

        // Ensure no invalid rows are created
        const existingParts = updateReq.parts ? updateReq.parts.filter(row => (row.itemNumber !== "" && row.id)) : []
        const newParts = updateReq.parts ? updateReq.parts.filter(row => (row.itemNumber !== "" && !row.id)) : []

        // Update existing parts rows
        for (const part of existingParts) {
            await prisma.partsReqRow.update({
                where: {
                    id: part.id
                },
                data: {
                    qty: part.qty,
                    itemNumber: part.itemNumber,
                    description: part.description,
                    cost: part.cost
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
                    cost: part.cost,
                    partsReqId: Number(req.params.id)
                }
            })

            // Add system comments
            const message = `Added (x${part.qty}): ${part.itemNumber}`
            const id = Number(req.params.id)

            await genSystemComment(message, user, id)
        }

        // Delete parts rows
        if (updateReq.delRows) {
            for (const row of updateReq.delRows) {
                await prisma.partsReqRow.delete({
                    where: {
                        id: row.id
                    }
                })

                // Add system comments
                const message = `Removed (x${row.qty}): ${row.itemNumber}`
                const id = Number(req.params.id)

                await genSystemComment(message, user, id)
            }
        }

        // Generate system comments based on what fields have changed
        // Status change
        if (oldPartsReq?.status !== updateReq.status) {
            const message = `Status Change: ${oldPartsReq?.status} -> ${updateReq.status}`
            const id = Number(req.params.id)

            await genSystemComment(message, user, id)
        }
        // AFE change
        if (oldPartsReq?.afe !== updateReq.afe) {
            const message = `AFE Change: ${oldPartsReq?.afe} -> ${updateReq.afe}`
            const id = Number(req.params.id)

            await genSystemComment(message, user, id)
        }
        // SO change
        if (oldPartsReq?.so !== updateReq.so) {
            const message = `SO Change: ${oldPartsReq?.so} -> ${updateReq.so}`
            const id = Number(req.params.id)

            await genSystemComment(message, user, id)
        }
        // Unit change
        if (oldPartsReq?.unitNumber !== updateReq.unit?.unitNumber) {
            const message = `Unit Change: ${oldPartsReq?.unitNumber} -> ${updateReq.unit?.unitNumber}`
            const id = Number(req.params.id)

            await genSystemComment(message, user, id)
        }
        // Truck change
        if (oldPartsReq?.truck !== updateReq.truck) {
            const message = `Truck Change: ${oldPartsReq?.truck} -> ${updateReq.truck}`
            const id = Number(req.params.id)

            await genSystemComment(message, user, id)
        }
        // Urgency change
        if (oldPartsReq?.urgency !== updateReq.urgency) {
            const message = `Urgency Change: ${oldPartsReq?.urgency} -> ${updateReq.urgency}`
            const id = Number(req.params.id)

            await genSystemComment(message, user, id)
        }
        // Order Type change
        if (oldPartsReq?.orderType !== updateReq.orderType) {
            const message = `Order Type Change: ${oldPartsReq?.orderType} -> ${updateReq.orderType}`
            const id = Number(req.params.id)

            await genSystemComment(message, user, id)
        }
        // Pickup Location change
        if (oldPartsReq?.pickup !== updateReq.pickup) {
            const message = `Pick Up Location Change: ${oldPartsReq?.pickup} -> ${updateReq.pickup}`
            const id = Number(req.params.id)

            await genSystemComment(message, user, id)
        }
        // Region change
        if (oldPartsReq?.region !== updateReq.region) {
            const message = `Region Change: ${oldPartsReq?.region} -> ${updateReq.region}`
            const id = Number(req.params.id)

            await genSystemComment(message, user, id)
        }

        // Add new comments
        if (updateReq.comments) {
            for (const comment of updateReq.comments) {
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
                contact: updateReq.contact,
                afe: updateReq.afe,
                so: updateReq.so,
                unitNumber: updateReq.unit?.unitNumber,
                truck: updateReq.truck,
                urgency: updateReq.urgency,
                orderType: updateReq.orderType,
                pickup: updateReq.pickup,
                region: updateReq.region,
                status: updateReq.status,
                updated: new Date().toISOString()
            }
        })

        res.status(200)
        return (updatedPartsReq)
    })
}


export default routes