import { Truck } from "../../models/netsuite/truck"

import { prisma } from "../../utils/prisma-client"

export const getAllTrucks = async () => {
    let trucks = await prisma.truck.findMany({
        orderBy: {
            name: "asc"
        }
    })

    return trucks as Array<Truck>
}