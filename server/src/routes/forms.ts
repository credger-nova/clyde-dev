import { FastifyInstance, FastifyRequest } from "fastify"
import { prisma } from "../utils/prisma-client"
import { PartsReq, UpdatePartsReq } from "../models/partsReq"

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
                    contact: obj.contact,
                    date: obj.date,
                    afe: obj.afe,
                    so: obj.so,
                    unit: obj.unit,
                    truck: obj.truck,
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
                contact: result.contact,
                date: result.date,
                afe: result.afe,
                so: result.so,
                unit: result.unit,
                truck: result.truck,
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
                status: req.body.status,
                updated: req.body.updated
            }
        })

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
        const newParts = updateReq.parts ? updateReq.parts.filter(row => (!row.id)) : []

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
        // Region change
        if (oldPartsReq?.region !== updateReq.region) {
            const message = `Region Change: ${oldPartsReq?.region} -> ${updateReq.region}`
            const id = Number(req.params.id)

            await genSystemComment(message, user, id)
        }
        // Part changes
        for (const part of existingParts) {
            console.log(part)
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