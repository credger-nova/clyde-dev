import { TITLES } from "../utils/titles"
import { LEAD_MECHANICS } from "../utils/lead-mechanics"
import { UNIT_PLANNING } from "../utils/unitPlanning"
import { PartsReq, PartsReqQuery, CreatePartsReq, UpdatePartsReq, OrderRow } from "../models/partsReq"
import { AFE } from "../models/afe"
import { NovaUser } from "../models/novaUser"
import { sendPrEmail } from "./postmark/send_email"
import { Comment } from "../models/comment"

import { prisma } from "../utils/prisma-client"

import { convertUser, getManagersEmployees, getDirectorsEmployees, getAllEmployees } from "./kpa/employee"

const PERMIAN_REGIONS = ["Pecos", "Carlsbad", "North Permian", "South Permian"]
const PERMIAN_CUSTOMER_SORT = ["APACHE CORPORATION", "CONOCOPHILLIPS CO", "DIAMONDBACK ENERGY", "MATADOR PRODUCTION COMPANY", "VITAL ENERGY INC"]

const URGENCY_SORT = ["LMC Safety Shutdown", "Unit Down", "Unit Set", "Rush", "Standard", "Stock"]

const SERVICE_SORT = ["Rejected - Adjustments Required", "Completed - Parts Staged/Delivered", "Closed - Partially Received", "Pending Approval", "Pending Quote",
    "Quote Provided - Pending Approval", "Approved - On Hold", "Approved", "Sourcing - In Progress", "Sourcing - Information Required", "Sourcing - Information Provided",
    "Sourcing - Pending Amex Approval", "Sourcing - Amex Approved", "Sourcing - Amex Rejected", "Sourcing - Request to Cancel", "Ordered - Awaiting Parts", "Closed - Parts in Hand", "Rejected - Closed",
    "Closed - Order Canceled"]
const MANAGER_STATUS_SORT = ["Pending Approval", "Quote Provided - Pending Approval", "Sourcing - Information Required", "Sourcing - Request to Cancel", "Rejected - Adjustments Required",
    "Approved - On Hold", "Approved", "Sourcing - In Progress", "Ordered - Awaiting Parts", "Completed - Parts Staged/Delivered", "Sourcing - Information Provided",
    "Sourcing - Pending Amex Approval", "Sourcing - Amex Approved", "Sourcing - Amex Rejected", "Closed - Partially Received", "Closed - Parts in Hand", "Rejected - Closed", "Closed - Order Canceled"]

const ALL_STATUS = ["Pending Approval", "Pending Quote", "Quote Provided - Pending Approval", "Rejected - Adjustments Required", "Approved - On Hold", "Approved",
    "Sourcing - In Progress", "Sourcing - Information Required", "Sourcing - Information Provided", "Sourcing - Pending Amex Approval", "Sourcing - Amex Approved",
    "Sourcing - Amex Rejected", "Sourcing - Request to Cancel", "Ordered - Awaiting Parts", "Completed - Parts Staged/Delivered", "Closed - Partially Received", "Closed - Parts in Hand",
    "Rejected - Closed", "Closed - Order Canceled"]
const SUPPLY_CHAIN_STATUS = [
    "Pending Quote", "Approved", "Sourcing - In Progress", "Sourcing - Information Required", "Sourcing - Information Provided", "Sourcing - Pending Amex Approval",
    "Sourcing - Amex Approved", "Sourcing - Amex Rejected", "Sourcing - Request to Cancel", "Ordered - Awaiting Parts", "Completed - Parts Staged/Delivered"
]
const SVP_STATUS = ["Pending Approval", "Quote Provided - Pending Approval"]

const FIELD_SHOP_SERVICE_TITLES = TITLES.filter(item => item.group === "Field Service" || item.group === "Shop Service").map(group => group.titles).flat()
const OPS_SHOP_MANAGER_TITLES = TITLES.filter(item => item.group === "Ops Manager" || item.group === "Shop Supervisor").map(group => group.titles).flat()
const OPS_SHOP_DIRECTOR_TITLES = TITLES.filter(item => item.group === "Ops Director" || item.group === "Shop Director").map(group => group.titles).flat()
const OPS_VP_TITLES = TITLES.find(item => item.group === "Ops Vice President")?.titles ?? []
const EMISSIONS_MANAGER_TITLES = TITLES.find(item => item.group === "Emissions Manager")?.titles ?? []
const SUPPLY_CHAIN_TITLES = TITLES.find(item => item.group === "Supply Chain")?.titles ?? []
const SC_MANAGEMENT_TITLES = TITLES.find(item => item.group === "Supply Chain Management")?.titles ?? []
const ADMIN_TITLES = TITLES.find(item => item.group === "Admin")?.titles ?? []
const EXEC_TITLES = TITLES.find(item => item.group === "Executive Management")?.titles ?? []
const IT_TITLES = TITLES.find(item => item.group === "IT")?.titles ?? []

// Function to cast to prisma PR to FE usable typing
function convertPartsReq(partsReq: any) {
    const typedPR = {
        id: partsReq.id,
        requester: convertUser(partsReq.requester),
        contact: partsReq.contact ? convertUser(partsReq.contact) : undefined,
        date: partsReq.date,
        billable: partsReq.billable,
        quoteOnly: partsReq.quoteOnly,
        warrantyJob: partsReq.warrantyJob,
        afe: partsReq.afe ? {
            id: partsReq.afe.id,
            number: partsReq.afe.number,
            amount: partsReq.afe.amount,
            unit: partsReq.afe.unit
        } as AFE : undefined,
        salesOrder: partsReq.salesOrder,
        unit: partsReq.unit,
        truck: partsReq.truck,
        urgency: partsReq.urgency,
        orderType: partsReq.orderType,
        pickup: partsReq.pickup,
        region: partsReq.region,
        parts: partsReq.parts,
        comments: partsReq.comments,
        files: partsReq.files,
        status: partsReq.status,
        amex: partsReq.amex,
        vendors: partsReq.vendors,
        conex: partsReq.conex,
        conexName: partsReq.conexName,
        updated: partsReq.updated
    } as PartsReq

    return typedPR
}

// Function to return a list of IDs of allowed requesters based on the user's permissions
async function allowedRequester(user: NovaUser | undefined | null) {
    if (user) {
        if (FIELD_SHOP_SERVICE_TITLES.includes(user.jobTitle)) {
            if (user.jobTitle.includes("Lead")) {
                const mechanics = LEAD_MECHANICS.find(group => group.leads.includes(user.id))?.mechanics
                return [user.id].concat(mechanics?.map(mechanic => mechanic.id) ?? [])
            } else {
                return [user.id]
            }
        } else if (OPS_SHOP_MANAGER_TITLES.includes(user.jobTitle)) {
            const employees = await getManagersEmployees(user.id)

            return employees.map((employee) => employee.id).concat(user.id)
        } else if (OPS_SHOP_DIRECTOR_TITLES.includes(user.jobTitle)) {
            const employees = await getDirectorsEmployees(user.id)

            return employees.map((employee) => employee.id).concat(user.id)
        } else if (OPS_VP_TITLES.includes(user.jobTitle)) {
            const allEmployees = await getAllEmployees()

            return allEmployees.map((employee) => employee.id)
        } else if (EMISSIONS_MANAGER_TITLES.includes(user.jobTitle)) {
            const employees = await getManagersEmployees(user.id)

            return employees.map((employee) => employee.id).concat(user.id)
        } else if (SUPPLY_CHAIN_TITLES.includes(user.jobTitle)) {
            const allEmployees = await getAllEmployees()

            return allEmployees.map((employee) => employee.id)
        } else if (SC_MANAGEMENT_TITLES.includes(user.jobTitle)) {
            const allEmployees = await getAllEmployees()

            return allEmployees.map((employee) => employee.id)
        } else if (ADMIN_TITLES.includes(user.jobTitle)) {
            const allEmployees = await getAllEmployees()

            return allEmployees.map((employee) => employee.id)
        } else if (EXEC_TITLES.includes(user.jobTitle)) {
            const allEmployees = await getAllEmployees()

            return allEmployees.map((employee) => employee.id)
        } else if (IT_TITLES.includes(user.jobTitle)) {
            const allEmployees = await getAllEmployees()

            return allEmployees.map((employee) => employee.id)
        }
    }

    const allEmployees = await getAllEmployees()

    return allEmployees.map((employee) => employee.id)
}

// Function to return a list of statuses allowed based on user's permissions
function allowedStatus(title: string, scAll: boolean) {
    if (FIELD_SHOP_SERVICE_TITLES.includes(title) || OPS_SHOP_MANAGER_TITLES.includes(title) || OPS_SHOP_DIRECTOR_TITLES.includes(title)) {
        return ALL_STATUS
    } else if (OPS_VP_TITLES.includes(title)) {
        return ALL_STATUS
    } else if (EMISSIONS_MANAGER_TITLES.includes(title)) {
        return ALL_STATUS
    } else if (SUPPLY_CHAIN_TITLES.includes(title)) {
        if (scAll) {
            return ALL_STATUS
        } else {
            return SUPPLY_CHAIN_STATUS
        }
    } else if (SC_MANAGEMENT_TITLES.includes(title)) {
        return ALL_STATUS
    } else if (ADMIN_TITLES.includes(title)) {
        return ALL_STATUS
    } else if (EXEC_TITLES.includes(title)) {
        return ALL_STATUS
    } else if (IT_TITLES.includes(title)) {
        return ALL_STATUS
    }
}

async function genSystemComment(message: string, user: NovaUser, id: number) {
    await prisma.comment.create({
        data: {
            comment: message,
            name: `${user.firstName} ${user.lastName}`,
            timestamp: new Date().toISOString(),
            partsReqId: id
        }
    })
}

function determineReceived(parts: Array<OrderRow> | undefined) {
    if (parts && Math.max(...parts.map(part => part.received)) > 0) {
        let closed = true
        for (const part of parts) {
            if (part.received !== part.qty) {
                closed = false
            }
        }
        if (closed) {
            return "Closed - Parts in Hand"
        } else {
            return "Closed - Partially Received"
        }
    } else {
        return "Completed - Parts Staged/Delivered"
    }
}

export function calcCost(parts: Array<OrderRow>) {
    let sum = 0

    for (const part of parts) {
        sum += part.cost ?? 0 * part.qty
    }

    return sum
}

export function getThreshold(hp: number) {
    if (hp > 100 && hp <= 400) {
        return 2000
    } else if (hp > 400 && hp <= 1000) {
        return 3000
    } else if (hp > 1000) {
        return 5000
    } else {
        return 0
    }
}

export function getNonPM(rows: Array<OrderRow>) {
    const nonPM = rows.filter((row) => row.mode !== "PM PARTS")

    return nonPM.length > 0
}

function opsVpApprovalRequired(unitNumber: string, hp: number, rows: Array<OrderRow>) {
    if (
        UNIT_PLANNING.includes(unitNumber) &&
        getThreshold(hp) <= calcCost(rows) &&
        getNonPM(rows)
    ) {
        return true
    } else {
        return false
    }
}

async function autoApprove(afe: AFE | undefined, prCost: number, title: string) {
    if (afe) {
        const existingCost = await sumPrWithAfe(afe)

        if (afe.amount && (prCost <= (Number(afe.amount) - existingCost))) {
            return true
        }
    } else if (OPS_SHOP_DIRECTOR_TITLES.includes(title) && prCost < 10000) {
        return true
    }

    return false
}

// Function to find the sum of PR costs with an associated AFE
export const sumPrWithAfe = async (afe: AFE) => {
    let sum = 0

    const partsReqs = await prisma.partsReq.findMany({
        where: {
            afe: { id: afe.id },
            status: { notIn: ["Pending Approval", "Pending Quote", "Quote Provided - Pending Approval", "Rejected - Adjustments Required", "Rejected - Closed"] }
        },
        include: {
            parts: true
        }
    })

    for (const partsReq of partsReqs) {
        sum += calcCost(partsReq.parts as Array<OrderRow>)
    }

    return sum
}

function noRate(rows: Array<Omit<OrderRow, "id">>) {
    for (const item of rows) {
        if (!item.cost) {
            return true
        }
    }
    return false
}

function sortPartsReqs(partsReqs: Array<PartsReq>, title?: string, region?: Array<string>) {
    // Permian sorting (status > date > customer > urgency)
    if (region && PERMIAN_REGIONS.filter(value => region.includes(value)).length > 0) {
        // Supply Chain sorting
        if (SUPPLY_CHAIN_TITLES.includes(title ?? "")) {
            partsReqs.sort((a, b) =>
                SUPPLY_CHAIN_STATUS.indexOf(a.status) - SUPPLY_CHAIN_STATUS.indexOf(b.status) ||
                URGENCY_SORT.indexOf(a.urgency) - URGENCY_SORT.indexOf(b.urgency) ||
                PERMIAN_CUSTOMER_SORT.indexOf(b.unit && b.unit.customer ? b.unit.customer : "") - PERMIAN_CUSTOMER_SORT.indexOf(a.unit && a.unit.customer ? a.unit.customer : "") ||
                a.date.getTime() - b.date.getTime()
            )
        } else if (FIELD_SHOP_SERVICE_TITLES.includes(title ?? "")) {
            partsReqs.sort((a, b) =>
                SERVICE_SORT.indexOf(a.status) - SERVICE_SORT.indexOf(b.status) ||
                URGENCY_SORT.indexOf(a.urgency) - URGENCY_SORT.indexOf(b.urgency) ||
                PERMIAN_CUSTOMER_SORT.indexOf(b.unit && b.unit.customer ? b.unit.customer : "") - PERMIAN_CUSTOMER_SORT.indexOf(a.unit && a.unit.customer ? a.unit.customer : "") ||
                a.date.getTime() - b.date.getTime()
            )
        } else if (OPS_SHOP_MANAGER_TITLES.includes(title ?? "") || OPS_SHOP_DIRECTOR_TITLES.includes(title ?? "")) {
            partsReqs.sort((a, b) =>
                MANAGER_STATUS_SORT.indexOf(a.status) - MANAGER_STATUS_SORT.indexOf(b.status) ||
                URGENCY_SORT.indexOf(a.urgency) - URGENCY_SORT.indexOf(b.urgency) ||
                PERMIAN_CUSTOMER_SORT.indexOf(b.unit && b.unit.customer ? b.unit.customer : "") - PERMIAN_CUSTOMER_SORT.indexOf(a.unit && a.unit.customer ? a.unit.customer : "") ||
                a.date.getTime() - b.date.getTime()
            )
        } else {
            partsReqs.sort((a, b) =>
                ALL_STATUS.indexOf(a.status) - ALL_STATUS.indexOf(b.status) ||
                URGENCY_SORT.indexOf(a.urgency) - URGENCY_SORT.indexOf(b.urgency) ||
                PERMIAN_CUSTOMER_SORT.indexOf(b.unit && b.unit.customer ? b.unit.customer : "") - PERMIAN_CUSTOMER_SORT.indexOf(a.unit && a.unit.customer ? a.unit.customer : "") ||
                a.date.getTime() - b.date.getTime()
            )
        }
    } else {
        // Default sorting (status > urgency > date)
        if (title && FIELD_SHOP_SERVICE_TITLES.includes(title)) {
            partsReqs.sort((a, b) =>
                SERVICE_SORT.indexOf(a.status) - ALL_STATUS.indexOf(b.status) ||
                URGENCY_SORT.indexOf(a.urgency) - URGENCY_SORT.indexOf(b.urgency) ||
                a.date.getTime() - b.date.getTime()
            )
        } else if (title && (OPS_SHOP_MANAGER_TITLES.includes(title) || OPS_SHOP_DIRECTOR_TITLES.includes(title))) {
            partsReqs.sort((a, b) =>
                MANAGER_STATUS_SORT.indexOf(a.status) - ALL_STATUS.indexOf(b.status) ||
                URGENCY_SORT.indexOf(a.urgency) - URGENCY_SORT.indexOf(b.urgency) ||
                a.date.getTime() - b.date.getTime()
            )
        } else if (title && SUPPLY_CHAIN_TITLES.includes(title)) {
            partsReqs.sort((a, b) =>
                SUPPLY_CHAIN_STATUS.indexOf(a.status) - ALL_STATUS.indexOf(b.status) ||
                URGENCY_SORT.indexOf(a.urgency) - URGENCY_SORT.indexOf(b.urgency) ||
                a.date.getTime() - b.date.getTime()
            )
        } else {
            partsReqs.sort((a, b) =>
                ALL_STATUS.indexOf(a.status) - ALL_STATUS.indexOf(b.status) ||
                URGENCY_SORT.indexOf(a.urgency) - URGENCY_SORT.indexOf(b.urgency) ||
                a.date.getTime() - b.date.getTime()
            )
        }
    }

    return partsReqs
}

// Get Parts Reqs that match the given query
export const getPartsReqs = async (query: PartsReqQuery) => {
    const result = await prisma.partsReq.findMany({
        where: {
            AND: [
                {
                    requester: {
                        id: {
                            in: await allowedRequester(query.user)
                        }
                    },
                    status: {
                        in: allowedStatus(query.user ? query.user.jobTitle : "", query.scAll ?? false)
                    }
                },
                {
                    AND: [
                        query.afe && query.afe.length > 0 ? { afe: { id: { in: query.afe } } } : {},
                        query.salesOrder && query.salesOrder.length > 0 ? { salesOrder: { id: { in: query.salesOrder } } } : {},
                        query.unitNumber && query.unitNumber.length > 0 ? { unitNumber: { in: query.unitNumber } } : {},
                        query.truck && query.truck.length > 0 ? { truck: { id: { in: query.truck } } } : {},
                        {}, // TODO: parts
                        query.requester && query.requester.length > 0 ? { requester: { id: { in: query.requester } } } : {},
                        query.customer && query.customer.length > 0 ? { unit: { customer: { in: query.customer } } } : {},
                        query.location && query.location.length > 0 ? { unit: { location: { in: query.location } } } : {},
                        query.region && query.region.length > 0 ? { region: { in: query.region, mode: "insensitive" } } : {},
                        query.urgency && query.urgency.length > 0 ? { urgency: { in: query.urgency } } : {},
                        query.status && query.status.length > 0 ? { status: { in: query.status } } : {}
                    ]
                },
                {
                    OR: [
                        { id: Number(query.searchString) ? { in: query.searchString ? [Number(query.searchString)] : [] } : {} },
                        { afe: { number: { contains: query.searchString ?? "", mode: "insensitive" } } },
                        { salesOrder: { number: { contains: query.searchString ?? "", mode: "insensitive" } } },
                        { unitNumber: { contains: query.searchString ?? "", mode: "insensitive" } },
                        { truck: { name: { contains: query.searchString ?? "", mode: "insensitive" } } },
                        {
                            requester: {
                                OR: [
                                    { firstName: { contains: query.searchString ?? "", mode: "insensitive" } },
                                    { lastName: { contains: query.searchString ?? "", mode: "insensitive" } }
                                ]
                            }
                        },
                        { unit: { customer: { contains: query.searchString ?? "", mode: "insensitive" } } },
                        { unit: { location: { contains: query.searchString ?? "", mode: "insensitive" } } },
                        { region: { contains: query.searchString ?? "", mode: "insensitive" } }
                    ]
                }
            ]
        },
        include: {
            requester: true,
            contact: true,
            unit: true,
            afe: {
                include: { unit: true }
            },
            salesOrder: true,
            truck: true,
            pickup: true,
            conexName: true,
            vendors: true,
            parts: true,
            comments: true,
            files: true
        }
    })

    let partsReqs = result.map((partsReq) => convertPartsReq(partsReq))

    // Filter Ops Vice President results to only units that require Ops Vice President privileges if vp toggle is on
    if (query.vpApproval) {
        partsReqs = partsReqs.filter((partsReq) => partsReq.unit && (calcCost(partsReq.parts) > 10000 ||
            opsVpApprovalRequired(partsReq.unit.unitNumber, Number(partsReq.unit.oemHP), partsReq.parts))
        )
    }

    partsReqs = sortPartsReqs(partsReqs, query.user!.jobTitle, query.user?.region)

    return partsReqs
}

// Get Parts Req by id
export const getPartsReq = async (id: number) => {
    const partsReq = await prisma.partsReq.findUnique({
        where: {
            id: id
        },
        include: {
            requester: true,
            contact: true,
            unit: true,
            afe: {
                include: { unit: true }
            },
            salesOrder: true,
            truck: true,
            pickup: true,
            conexName: true,
            vendors: true,
            parts: true,
            comments: true,
            files: true
        }
    })

    if (partsReq) {
        return convertPartsReq(partsReq)
    } else {
        return null
    }
}

// Create a Parts Req form
export const createPartsReq = async (partsReq: CreatePartsReq) => {
    // Ensure no invalid rows are created
    partsReq.parts = partsReq.parts.filter(row => row.itemNumber !== "")

    const status = partsReq.quoteOnly ? "Pending Quote" : await autoApprove(partsReq.afe, calcCost(partsReq.parts as Array<OrderRow>), partsReq.requester.jobTitle) ?
        "Approved" : "Pending Approval"

    const newPartsReq = await prisma.partsReq.create({
        data: {
            requesterId: partsReq.requester.id,
            date: partsReq.date,
            billable: partsReq.billable,
            quoteOnly: partsReq.quoteOnly,
            warrantyJob: partsReq.warrantyJob,
            afeId: partsReq.afe ? partsReq.afe.id : null,
            salesOrderId: partsReq.salesOrder ? partsReq.salesOrder.id : null,
            unitNumber: partsReq.unit ? partsReq.unit.unitNumber : null,
            truckId: partsReq.truck ? partsReq.truck.id : null,
            urgency: partsReq.urgency,
            orderType: partsReq.orderType,
            region: partsReq.region ?? "",
            amex: partsReq.amex,
            conex: partsReq.conex,
            conexId: partsReq.conexName ? partsReq.conexName.id : null,
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
            status: status,
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

    const emailPR = await prisma.partsReq.findUnique({
        where: {
            id: newPartsReq.id
        },
        include: {
            requester: true,
            contact: true,
            unit: true,
            afe: {
                include: { unit: true }
            },
            salesOrder: true,
            truck: true,
            pickup: true,
            conexName: true,
            parts: true,
            comments: true,
            files: true
        }
    })

    // Send email notification
    sendPrEmail(
        {
            partsReq: convertPartsReq(emailPR)
        },
        true
    )

    return createdPartsReq
}

// Update existing Parts Req
export const updatePartsReq = async (id: number, user: NovaUser, updateReq: Partial<UpdatePartsReq>) => {
    // Flag to determine if anything was updated
    let updated: boolean = false

    // Get existing version of the Parts Req for comment generation
    const oldPartsReq = await prisma.partsReq.findUnique({
        where: {
            id: id
        },
        include: {
            requester: true,
            contact: true,
            unit: true,
            afe: {
                include: { unit: true }
            },
            salesOrder: true,
            truck: true,
            pickup: true,
            conexName: true,
            vendors: true,
            parts: true,
            comments: true,
            files: true
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
            oldPart.cost !== part.cost || oldPart.received !== part.received) {
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
                    cost: part.cost,
                    received: part.received,
                    mode: part.mode
                }
            })
        }
    }

    // Determine status of updated Parts Req
    let status = partsUpdated && ((calcCost(updateReq.parts ?? []) > 5000) ||
        (oldPartsReq?.status === "Rejected - Adjustments Required" || updateReq.status === "Rejected - Adjustments Required")) ?
        "Pending Approval" : updateReq.status

    if (partsUpdated && (oldPartsReq?.status === "Approved" || oldPartsReq?.status === "Sourcing - Information Provided")) {
        status = "Pending Approval"
    }

    if (partsUpdated && updateReq.status === "Completed - Parts Staged/Delivered") {
        status = determineReceived(updateReq.parts)
    }

    if (updateReq.status === "Sourcing - Amex Rejected" && oldPartsReq?.status !== "Sourcing - Amex Rejected") {
        updateReq.amex = false
        updateReq.vendors = []
    }

    if (partsUpdated) {
        updated = true
    }

    // Add new parts rows
    for (const part of newParts) {
        updated = true
        await prisma.partsReqRow.create({
            data: {
                qty: part.qty,
                itemNumber: part.itemNumber,
                description: part.description,
                cost: part.cost,
                mode: part.mode,
                partsReqId: id
            }
        })

        // Add system comments
        const message = `Added (x${part.qty}): ${part.itemNumber}`

        await genSystemComment(message, user, id)
    }

    // Delete parts rows
    if (updateReq.delRows && updateReq.delRows.length > 0) {
        updated = true
        for (const row of updateReq.delRows) {
            await prisma.partsReqRow.delete({
                where: {
                    id: row.id
                }
            })

            // Add system comments
            const message = `Removed (x${row.qty}): ${row.itemNumber}`

            await genSystemComment(message, user, id)
        }
    }

    // Mark files as deleted
    for (const file of updateReq.delFiles ?? []) {
        updated = true
        const delFile = await prisma.file.update({
            where: {
                id: file
            },
            data: {
                isDeleted: true
            }
        })

        // Add system comments
        const message = `Removed Document: ${delFile.name}`

        await genSystemComment(message, user, id)
    }

    const newFileIds = []
    // Create new files
    for (const file of updateReq.newFiles ?? []) {
        updated = true
        const newFile = await prisma.file.create({
            data: {
                name: file,
                partsReqId: id,
                isDeleted: false
            }
        })
        newFileIds.push(newFile.id)

        // Add system comments
        const message = `Added Document: ${file}`

        await genSystemComment(message, user, id)
    }

    // Generate system comments based on what fields have changed
    // Status change
    if (oldPartsReq?.status !== status) {
        updated = true
        const message = `Status Change: ${oldPartsReq?.status} -> ${status}`

        await genSystemComment(message, user, id)
    }
    // AFE change
    if (oldPartsReq?.afe?.id !== updateReq.afe?.id) {
        updated = true
        const message = `AFE Change: ${oldPartsReq?.afe?.number} -> ${updateReq.afe?.number}`

        await genSystemComment(message, user, id)
    }
    // SO change
    if (oldPartsReq?.salesOrder?.id !== updateReq.salesOrder?.id) {
        updated = true
        const message = `SO Change: ${oldPartsReq?.salesOrder?.number} -> ${updateReq.salesOrder?.number}`

        await genSystemComment(message, user, id)
    }
    // Unit change
    if (oldPartsReq?.unitNumber !== updateReq.unit?.unitNumber) {
        if (!!oldPartsReq?.unitNumber || !!updateReq.unit?.unitNumber) {
            updated = true
            const message = `Unit Change: ${oldPartsReq?.unitNumber} -> ${updateReq.unit?.unitNumber}`

            await genSystemComment(message, user, id)
        }
    }
    // Truck change
    if (oldPartsReq?.truck?.id !== updateReq.truck?.id) {
        updated = true
        const message = `Truck Change: ${oldPartsReq?.truck?.name} -> ${updateReq.truck?.name}`

        await genSystemComment(message, user, id)
    }
    // Urgency change
    if (oldPartsReq?.urgency !== updateReq.urgency) {
        updated = true
        const message = `Urgency Change: ${oldPartsReq?.urgency} -> ${updateReq.urgency}`

        await genSystemComment(message, user, id)
    }
    // Order Type change
    if (oldPartsReq?.orderType !== updateReq.orderType) {
        updated = true
        const message = `Order Type Change: ${oldPartsReq?.orderType} -> ${updateReq.orderType}`

        await genSystemComment(message, user, id)
    }
    // Pickup Location change
    if (oldPartsReq?.pickup?.id !== updateReq.pickup?.id) {
        updated = true
        const message = `Pick Up Location Change: ${oldPartsReq?.pickup?.name} -> ${updateReq.pickup?.name}`

        await genSystemComment(message, user, id)
    }
    // Region change
    if (oldPartsReq?.region !== updateReq.region) {
        updated = true
        const message = `Region Change: ${oldPartsReq?.region} -> ${updateReq.region}`

        await genSystemComment(message, user, id)
    }
    // Amex change
    if (oldPartsReq?.amex !== updateReq.amex) {
        updated = true
        if (updateReq.amex && !noRate(updateReq.parts as Array<Omit<OrderRow, "id">>) && !oldPartsReq?.amex &&
            calcCost(updateReq.parts ?? []) > 500) {
            status = "Sourcing - Pending Amex Approval"
        }

        const message = `Amex Request Change: ${oldPartsReq?.amex} -> ${updateReq.amex}`

        await genSystemComment(message, user, id)
    }
    // Vendor change
    if (oldPartsReq?.vendors !== updateReq.vendors) {
        updated = true
        const message = `Vendor Change: ${oldPartsReq?.vendors} -> ${updateReq.vendors}`

        await genSystemComment(message, user, id)
    }
    // Conex change
    if (oldPartsReq?.conexName?.id !== updateReq.conexName?.id) {
        updated = true
        const message = `Conex Change: ${oldPartsReq?.conexName?.name} -> ${updateReq.conexName?.name}`

        await genSystemComment(message, user, id)
    }

    // Add new comments
    if (updateReq.comments) {
        for (const comment of updateReq.comments) {
            if (!comment.id) {
                updated = true
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

    // Check to see if anything was updated during a Rejected status update
    if (updated && oldPartsReq?.status === "Rejected - Adjustments Required") {
        status = "Pending Approval"
    }

    // Update parts req fields
    await prisma.partsReq.update({
        where: {
            id: id
        },
        data: {
            contactId: updateReq.contact ? updateReq.contact.id : null,
            quoteOnly: updateReq.quoteOnly,
            afeId: updateReq.afe ? updateReq.afe.id : null,
            salesOrderId: updateReq.salesOrder ? updateReq.salesOrder.id : null,
            unitNumber: updateReq.unit ? updateReq.unit.unitNumber : null,
            truckId: updateReq.truck ? updateReq.truck.id : null,
            urgency: updateReq.urgency,
            orderType: updateReq.orderType,
            pickupId: updateReq.pickup ? updateReq.pickup.id : null,
            region: updateReq.region,
            amex: updateReq.amex,
            conex: updateReq.conex,
            conexId: updateReq.conexName ? updateReq.conexName.id : null,
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

    const emailPR = await prisma.partsReq.findUnique({
        where: {
            id: id
        },
        include: {
            requester: true,
            contact: true,
            unit: true,
            afe: {
                include: { unit: true }
            },
            salesOrder: true,
            truck: true,
            pickup: true,
            conexName: true,
            parts: true,
            comments: true,
            files: true
        }
    })

    // Send email notification if status has changed
    if (oldPartsReq?.status !== status) {
        await sendPrEmail(
            {
                partsReq: convertPartsReq(emailPR)
            },
            false
        )
    }

    return updatedPartsReq
}

// Function to get comments given a PR id
export const getPartsReqComments = async (id: number) => {
    const comments = await prisma.comment.findMany({
        where: {
            partsReqId: id
        },
        orderBy: {
            timestamp: "desc"
        }
    })

    return comments as Array<Comment>
}