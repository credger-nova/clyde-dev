import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import { SalesOrder } from "../../types/netsuite/sales-order"

// Get all Sales Orders
const getAllSOs = async () => {
    const { data } = await axios.get<Array<SalesOrder>>(`${import.meta.env.VITE_API_BASE}/netsuite/sales-orders`)

    return data
}

export function useSOs() {
    return useQuery({ queryKey: ["Sales Orders"], queryFn: getAllSOs })
}