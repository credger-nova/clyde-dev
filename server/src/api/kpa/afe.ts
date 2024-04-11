import { AFE } from "../../models/afe"

import { prisma } from "../../utils/prisma-client"

export const getAllAfe = async () => {
    let afes = await prisma.aFE.findMany({
        include: {
            unit: true
        }
    })

    // Filter out any closed AFEs
    afes = afes.filter(afe => /^-?\d+\.?\d*$/.test(afe.number))

    // Convert to correct type
    let tyepdAfes = afes.map((afe) => {
        return ({
            id: afe.id,
            number: afe.number,
            amount: afe.amount,
            unit: afe.unit
        } as AFE)
    })

    return tyepdAfes
}