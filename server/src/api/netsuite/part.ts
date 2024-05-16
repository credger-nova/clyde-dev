import { Part } from "../../models/netsuite/part"

import { prisma } from "../../utils/prisma-client"

export const getAllParts = async (inactive?: "true") => {
    let parts = await prisma.part.findMany({
        where: {
            ...(inactive !== "true" ? { active: true } : {})
        },
        orderBy: {
            itemNumber: "asc"
        }
    })

    return parts as Array<Part>
}