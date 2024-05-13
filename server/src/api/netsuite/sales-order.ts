import { SalesOrder } from "../../models/netsuite/sales-order"

import { prisma } from "../../utils/prisma-client"

export const getAllSalesOrders = async (inactive?: "true") => {
    let salesOrders = await prisma.salesOrder.findMany({
        where: {
            ...(inactive !== "true" ? {
                status: {
                    in: ["Pending Fulfillment", "Pending Approval"]
                }
            } : {})
        },
        orderBy: {
            number: "desc"
        }
    })

    return salesOrders as Array<SalesOrder>
}