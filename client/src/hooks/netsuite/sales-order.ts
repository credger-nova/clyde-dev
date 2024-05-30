import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import { SalesOrder } from "../../types/netsuite/sales-order"

// Get all Sales Orders
const getAllSalesOrders = async (token: string, inactive?: boolean) => {
    const { data } = await axios.get<Array<SalesOrder>>(`${import.meta.env.VITE_API_BASE}/netsuite/sales-orders${inactive ? '?inactive=true' : ''}`,
        { headers: { Authorization: `Bearer ${token}` } })

    return data
}

export function useSalesOrders(token: string, inactive?: boolean) {
    return useQuery({ queryKey: ["Sales Orders"], queryFn: () => getAllSalesOrders(token, inactive) })
}