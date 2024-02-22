import { prisma } from "../utils/prisma-client"
import { GeoJSONFeature } from "../models/geoJson"

// Function to format and return coordinates of a unit
const formatCoordinates = (coords: string | null) => {
    if (coords) {
        const splitCoords = coords.split(",")
        if (Number(splitCoords[1] && Number(splitCoords[0]))) {
            return [Number(splitCoords[1]), Number(splitCoords[0])]
        } else {
            return null
        }
    } else {
        return null
    }
}

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

// Generate GeoJSON layer for all units
export const generateUnitsLayer = async () => {
    const features: Array<GeoJSONFeature> = []

    const allUnits = await prisma.unit.findMany()

    for (const unit of allUnits) {
        if (formatCoordinates(unit.coordinates)) {
            const feature = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: formatCoordinates(unit.coordinates)
                },
                properties: {
                    unitNumber: unit.unitNumber,
                    customer: unit.customer,
                    location: unit.location,
                    county: unit.county,
                    state: unit.state,
                    region: unit.operationalRegion,
                    engine: unit.engine,
                    frame: unit.compressorFrame,
                    oemHP: unit.oemHP,
                    status: unit.status,
                    mechanic: unit.assignedTechnician,
                    manager: unit.assignedManager,
                    director: unit.assignedDirector,
                    coordinates: unit.coordinates
                }
            } as GeoJSONFeature

            features.push(feature)
        }
    }

    const layer = {
        type: "FeatureCollection",
        features: features
    }

    return layer
}