import { prisma } from "../utils/prisma-client"
import { GeoJSONFeature } from "../models/geoJson"

const REGION_SORT = ["CARLSBAD", "PECOS", "NORTH PERMIAN", "SOUTH PERMIAN", "EAST TEXAS", "SOUTH TEXAS", "MIDCON"]

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
                unitNumber: "asc",
            },
        ],
    })

    return allUnits
}

// Get single unit by Unit Number
export const getUnit = async (unitNum: string) => {
    const unit = await prisma.unit.findUnique({
        where: {
            unitNumber: unitNum,
        },
    })

    return unit
}

// Get list of customers from units
export const getAllCustomers = async () => {
    const allUnits = await prisma.unit.findMany({
        distinct: ["customer"],
        select: {
            customer: true,
        },
    })

    const customers = allUnits
        .map((item) => item.customer)
        .filter((item) => item)
        .sort()

    return customers
}

// Get list of locations from units
export const getAllLocations = async () => {
    const allUnits = await prisma.unit.findMany({
        distinct: ["location"],
        select: {
            location: true,
        },
    })

    const locations = allUnits
        .map((item) => item.location)
        .filter((item) => item)
        .sort()

    return locations
}

// Get list of regions from units
export const getAllRegions = async () => {
    const allUnits = await prisma.unit.findMany({
        distinct: ["operationalRegion"],
        select: {
            operationalRegion: true,
        },
    })

    const regions = allUnits
        .map((item) => item.operationalRegion)
        .filter((item) => item)
        .sort((a, b) => REGION_SORT.indexOf(a ?? "") - REGION_SORT.indexOf(b ?? ""))

    return regions
}

// Get list of managers from units
export const getAllManagers = async () => {
    const allUnits = await prisma.unit.findMany({
        distinct: ["assignedManager"],
        select: {
            assignedManager: true,
        },
    })

    const managers = allUnits
        .map((item) => item.assignedManager)
        .filter((item) => item)
        .sort()

    return managers
}

// Generate GeoJSON layer for all units
export const generateUnitsLayer = async (manager?: string) => {
    const features: Array<GeoJSONFeature> = []
    let allUnits

    if (manager) {
        allUnits = await prisma.unit.findMany({
            where: {
                assignedManager: manager,
            },
        })
    } else {
        allUnits = await prisma.unit.findMany()
    }

    for (const unit of allUnits) {
        if (formatCoordinates(unit.coordinates)) {
            const feature = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: formatCoordinates(unit.coordinates),
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
                    coordinates: unit.coordinates,
                },
            } as GeoJSONFeature

            features.push(feature)
        }
    }

    const layer = {
        type: "FeatureCollection",
        features: features,
    }

    return layer
}

// Get centroid of GeoJSON Point layer
export const getCentroid = (features: Array<GeoJSONFeature>) => {
    const lat = []
    const long = []

    for (const feature of features) {
        lat.push(feature.geometry.coordinates![1] as number)
        long.push(feature.geometry.coordinates![0] as number)
    }

    const minLat = Math.min(...lat)
    const maxLat = Math.max(...lat)
    const minLong = Math.min(...long)
    const maxLong = Math.max(...long)

    const latCenter = (minLat + maxLat) / 2
    const longCenter = (minLong + maxLong) / 2

    return [latCenter, longCenter]
}
