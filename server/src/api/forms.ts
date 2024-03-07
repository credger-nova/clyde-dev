import { prisma } from "../utils/prisma-client"
import { CreatePartsReq, PartsReq, PartsReqQuery, UpdatePartsReq } from "../models/partsReq"
import { TITLES } from "../utils/titles"
import { NovaUser } from "../models/novaUser"
import { getDirectorsEmployees, getManagersEmployees } from "./kpa"

const URGENCY_SORT = ["Unit Down", "Rush", "Standard", "Stock"]
const ALL_STATUS = ["Pending Approval", "Rejected - Adjustments Required", "Approved", "Sourcing - Information Required", "Sourcing - Information Provided",
    "Sourcing - Pending Approval", "Ordered - Awaiting Parts", "Completed - Parts Staged/Delivered", "Closed - Parts in Hand"]
const SUPPLY_CHAIN_STATUS = [
    "Sourcing - Information Required", "Sourcing - Information Provided", "Sourcing - Pending Approval", "Ordered - Awaiting Parts", "Completed - Parts Staged/Delivered"
]
const SVP_STATUS = ["Pending Approval"]

const FIELD_SERVICE_TITLES = TITLES.find(item => item.group === "Field Service")?.titles ?? []
const OPS_MANAGER_TITLES = TITLES.find(item => item.group === "Ops Manager")?.titles ?? []
const OPS_DIRECTOR_TITLES = TITLES.find(item => item.group === "Ops Director")?.titles ?? []
const SUPPLY_CHAIN_TITLES = TITLES.find(item => item.group === "Supply Chain")?.titles ?? []
const SVP_TITLES = TITLES.find(item => item.group === "SVP")?.titles ?? []
const IT_TITLES = TITLES.find(item => item.group === "IT")?.titles ?? []

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

function allowedStatus(title: string) {
    if (FIELD_SERVICE_TITLES.includes(title) || OPS_MANAGER_TITLES.includes(title) || OPS_DIRECTOR_TITLES.includes(title)) {
        return ALL_STATUS
    } else if (SVP_TITLES.includes(title)) {
        return SVP_STATUS
    } else if (SUPPLY_CHAIN_TITLES.includes(title)) {
        return SUPPLY_CHAIN_STATUS
    } else if (IT_TITLES.includes(title)) {
        return ALL_STATUS
    }
}

async function allowedRequester(user: NovaUser | undefined | null) {
    if (user) {
        if (FIELD_SERVICE_TITLES.includes(user.title)) {
            return [`${user.firstName} ${user.lastName}`]
        } else if (OPS_MANAGER_TITLES.includes(user.title)) {
            const employees = await getManagersEmployees(user.id)

            return employees.map((employee) => `${employee.firstName} ${employee.lastName}`)
        } else if (OPS_DIRECTOR_TITLES.includes(user.title)) {
            const employees = await getDirectorsEmployees(user.id)

            return employees.map((employee) => `${employee.firstName} ${employee.lastName}`)
        } else if (SVP_TITLES.includes(user.title)) {

        } else if (SUPPLY_CHAIN_TITLES.includes(user.title)) {

        } else if (IT_TITLES.includes(user.title)) {

        }
    }
}

// Get Parts Reqs that match the given query
export const getPartsReqs = async (query: PartsReqQuery) => {
    const result = await prisma.partsReq.findMany({
        where: {
            AND: [
                {
                    requester: {
                        in: await allowedRequester(query.user)
                    },
                    status: {
                        in: allowedStatus(query.user ? query.user.title : "")
                    }
                },
                {
                    AND: [
                        query.afe && query.afe.length > 0 ? { afe: { in: query.afe } } : {},
                        query.so && query.so.length > 0 ? { so: { in: query.so } } : {},
                        query.unitNumber && query.unitNumber.length > 0 ? { unitNumber: { in: query.unitNumber } } : {},
                        query.truck && query.truck.length > 0 ? { truck: { in: query.truck } } : {},
                        {}, // TODO: parts
                        query.requester && query.requester.length > 0 ? { requester: { in: query.requester } } : {},
                        query.customer && query.customer.length > 0 ? { unit: { customer: { in: query.customer } } } : {},
                        query.location && query.location.length > 0 ? { unit: { location: { in: query.location } } } : {},
                        query.region && query.region.length > 0 ? { unit: { operationalRegion: { in: query.region } } } : {},
                        query.urgency && query.urgency.length > 0 ? { urgency: { in: query.urgency } } : {},
                        query.status && query.status.length > 0 ? { status: { in: query.status } } : {}
                    ]
                },
                {
                    OR: [
                        { id: Number(query.searchString) ? { in: query.searchString ? [Number(query.searchString)] : [] } : {} },
                        { afe: { contains: query.searchString ?? "", mode: "insensitive" } },
                        { so: { contains: query.searchString ?? "", mode: "insensitive" } },
                        { unitNumber: { contains: query.searchString ?? "", mode: "insensitive" } },
                        { truck: { contains: query.searchString ?? "", mode: "insensitive" } },
                        { requester: { contains: query.searchString ?? "", mode: "insensitive" } },
                        { unit: { customer: { contains: query.searchString ?? "", mode: "insensitive" } } },
                        { unit: { location: { contains: query.searchString ?? "", mode: "insensitive" } } },
                        { unit: { operationalRegion: { contains: query.searchString ?? "", mode: "insensitive" } } }
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
                amex: obj.amex,
                vendor: obj.vendor,
                updated: obj.updated
            } as PartsReq
        )
    })

    // Sort by Urgency and Date
    partsReqs.sort((a, b) => URGENCY_SORT.indexOf(a.urgency) - URGENCY_SORT.indexOf(b.urgency) || a.date.getTime() - b.date.getTime())

    return partsReqs
}

// Get single Parts Req by id
export const getPartsReq = async (id: number) => {
    const result = await prisma.partsReq.findUnique({
        where: {
            id: id
        },
        include: {
            parts: true,
            comments: true,
            unit: true,
            files: true
        }
    })

    if (result) {
        return {
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
            amex: result.amex,
            vendor: result.vendor,
            updated: result.updated
        } as PartsReq
    } else {
        return null
    }
}

// Create a Parts Req form
export const createPartsReq = async (partsReq: CreatePartsReq) => {
    // Ensure no invalid rows are created
    partsReq.parts = partsReq.parts.filter(row => row.itemNumber !== "")

    const newPartsReq = await prisma.partsReq.create({
        data: {
            requester: partsReq.requester,
            date: partsReq.date,
            afe: partsReq.afe,
            so: partsReq.so,
            unitNumber: partsReq.unit ? partsReq.unit.unitNumber : null,
            truck: partsReq.truck,
            urgency: partsReq.urgency,
            orderType: partsReq.orderType,
            region: partsReq.region,
            amex: partsReq.amex,
            vendor: partsReq.vendor,
            parts: {
                createMany: {
                    data: partsReq.parts
                }
            },
            comments: {
                createMany: {
                    data: partsReq.comments
                }
            },
            files: {
                createMany: {
                    data: partsReq.files.map((file) => {
                        return ({
                            name: file
                        })
                    })
                }
            },
            status: partsReq.status,
            updated: partsReq.updated
        }
    })

    const createdPartsReq = await prisma.partsReq.findUnique({
        where: {
            id: newPartsReq.id
        },
        include: {
            files: true
        }
    })

    return createdPartsReq
}

// Update existing Parts Req
export const updatePartsReq = async (id: number, user: string, updateReq: Partial<UpdatePartsReq>) => {
    // Get existing version of the Parts Req for comment generation
    const oldPartsReq = await prisma.partsReq.findUnique({
        where: {
            id: id
        }
    })

    // Ensure no invalid rows are created
    const existingParts = updateReq.parts ? updateReq.parts.filter(row => (row.itemNumber !== "" && row.id)) : []
    const newParts = updateReq.parts ? updateReq.parts.filter(row => (row.itemNumber !== "" && !row.id)) : []

    // Check if any existing parts were updated, update where necessary
    let partsUpdated: boolean = newParts.length > 0 ? true : false
    for (const part of existingParts) {
        const oldPart = await prisma.partsReqRow.findUnique({
            where: {
                id: part.id
            }
        })

        if (oldPart?.qty !== part.qty || oldPart.itemNumber !== part.itemNumber || oldPart.description !== part.description ||
            oldPart.cost !== part.cost) {
            partsUpdated = true

            // Update part
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
    }

    // Determine status of updated Parts Req
    let status = partsUpdated && (oldPartsReq?.status !== "Sourcing - Information Required" && updateReq.status !== "Sourcing - Information Required") ?
        "Pending Approval" : updateReq.status

    // Add new parts rows
    for (const part of newParts) {
        await prisma.partsReqRow.create({
            data: {
                qty: part.qty,
                itemNumber: part.itemNumber,
                description: part.description,
                cost: part.cost,
                partsReqId: id
            }
        })

        // Add system comments
        const message = `Added(x${part.qty}): ${part.itemNumber} `

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
            const message = `Removed(x${row.qty}): ${row.itemNumber} `

            await genSystemComment(message, user, id)
        }
    }

    // Mark files as deleted
    for (const file of updateReq.delFiles ?? []) {
        const delFile = await prisma.file.update({
            where: {
                id: file
            },
            data: {
                isDeleted: true
            }
        })

        // Add system comments
        const message = `Removed Document: ${delFile.name} `

        await genSystemComment(message, user, id)
    }

    const newFileIds = []
    // Create new files
    for (const file of updateReq.newFiles ?? []) {
        const newFile = await prisma.file.create({
            data: {
                name: file,
                partsReqId: id,
                isDeleted: false
            }
        })
        newFileIds.push(newFile.id)

        // Add system comments
        const message = `Added Document: ${file} `

        await genSystemComment(message, user, id)
    }

    // Generate system comments based on what fields have changed
    // Status change
    if (oldPartsReq?.status !== status) {
        const message = `Status Change: ${oldPartsReq?.status} -> ${status} `

        await genSystemComment(message, user, id)
    }
    // AFE change
    if (oldPartsReq?.afe !== updateReq.afe) {
        const message = `AFE Change: ${oldPartsReq?.afe} -> ${updateReq.afe} `

        await genSystemComment(message, user, id)
    }
    // SO change
    if (oldPartsReq?.so !== updateReq.so) {
        const message = `SO Change: ${oldPartsReq?.so} -> ${updateReq.so} `

        await genSystemComment(message, user, id)
    }
    // Unit change
    if (oldPartsReq?.unitNumber !== updateReq.unit?.unitNumber) {
        const message = `Unit Change: ${oldPartsReq?.unitNumber} -> ${updateReq.unit?.unitNumber} `

        await genSystemComment(message, user, id)
    }
    // Truck change
    if (oldPartsReq?.truck !== updateReq.truck) {
        const message = `Truck Change: ${oldPartsReq?.truck} -> ${updateReq.truck} `

        await genSystemComment(message, user, id)
    }
    // Urgency change
    if (oldPartsReq?.urgency !== updateReq.urgency) {
        const message = `Urgency Change: ${oldPartsReq?.urgency} -> ${updateReq.urgency} `

        await genSystemComment(message, user, id)
    }
    // Order Type change
    if (oldPartsReq?.orderType !== updateReq.orderType) {
        const message = `Order Type Change: ${oldPartsReq?.orderType} -> ${updateReq.orderType} `

        await genSystemComment(message, user, id)
    }
    // Pickup Location change
    if (oldPartsReq?.pickup !== updateReq.pickup) {
        const message = `Pick Up Location Change: ${oldPartsReq?.pickup} -> ${updateReq.pickup} `

        await genSystemComment(message, user, id)
    }
    // Region change
    if (oldPartsReq?.region !== updateReq.region) {
        const message = `Region Change: ${oldPartsReq?.region} -> ${updateReq.region} `

        await genSystemComment(message, user, id)
    }
    // Amex change
    if (oldPartsReq?.amex !== updateReq.amex) {
        if (updateReq.amex) {
            status = "Sourcing - Pending Approval"
        }

        const message = `Amex Request Change: ${oldPartsReq?.amex} -> ${updateReq.amex} `

        await genSystemComment(message, user, id)
    }
    // Vendor change
    if (oldPartsReq?.vendor !== updateReq.vendor) {
        const message = `Vendor Change: ${oldPartsReq?.vendor} -> ${updateReq.vendor} `

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
                        partsReqId: id
                    }
                })
            }
        }
    }

    // Update parts req fields
    await prisma.partsReq.update({
        where: {
            id: id
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
            amex: updateReq.amex,
            vendor: updateReq.vendor,
            status: status,
            updated: new Date().toISOString()
        }
    })

    const updatedPartsReq = await prisma.partsReq.findUnique({
        where: {
            id: id
        },
        select: {
            files: {
                where: {
                    id: { in: newFileIds }
                }
            }
        }
    })

    return updatedPartsReq
}