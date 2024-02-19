import { prisma } from "../utils/prisma-client"

// Get all units
export const getAllUnits = async () => {
    const allUnits = await prisma.unit.findMany({
        orderBy: [
            {
                unitNumber: "asc"
            }
        ]
    })

    return allUnits
}

// Get single unit by Unit Number
export const getUnit = async (unitNum: string) => {
    const unit = await prisma.unit.findUnique({
        where: {
            unitNumber: unitNum
        }
    })

    return unit
}

// Get list of customers from units
export const getAllCustomers = async () => {
    const allUnits = await prisma.unit.findMany({
        distinct: ["customer"],
        select: {
            customer: true
        }
    })

    const customers = allUnits
        .map(item => item.customer)
        .filter(item => item)
        .sort()

    return customers
}

// Get list of regions from units
export const getAllRegions = async () => {
    const allUnits = await prisma.unit.findMany({
        distinct: ["operationalRegion"],
        select: {
            operationalRegion: true
        }
    })

    const regions = allUnits
        .map(item => item.operationalRegion)
        .filter(item => item)
        .sort()

    return regions
}