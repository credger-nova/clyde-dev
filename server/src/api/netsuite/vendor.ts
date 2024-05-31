import { Vendor } from "../../models/netsuite/vendor"

import { prisma } from "../../utils/prisma-client"

export const getAllVendors = async (inactive?: "true") => {
    let vendors = await prisma.vendor.findMany({
        where: {
            ...(inactive !== "true" ? { active: true } : {}),
        },
        orderBy: {
            name: "asc",
        },
    })

    return vendors as Array<Vendor>
}
