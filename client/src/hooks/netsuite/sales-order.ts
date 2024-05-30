import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import { SalesOrder } from "../../types/netsuite/sales-order"

// Get all Sales Orders
const getAllSalesOrders = async (inactive: boolean) => {
    const { data } = await axios.get<Array<SalesOrder>>(`${import.meta.env.VITE_API_BASE}/netsuite/sales-orders${inactive ? '?inactive=true' : ''}`)

    return data
}

export function useSalesOrders(inactive: boolean) {
    return useQuery({ queryKey: ["Sales Orders"], queryFn: () => getAllSalesOrders(inactive) })
}