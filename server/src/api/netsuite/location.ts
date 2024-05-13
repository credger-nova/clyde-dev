import { Location } from "../../models/netsuite/location"

import { prisma } from "../../utils/prisma-client"

export const getAllLocations = async () => {
    let locations = await prisma.location.findMany({
        orderBy: {
            name: "asc"
        }
    })

    return locations as Array<Location>
}