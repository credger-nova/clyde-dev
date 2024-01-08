import { useQuery } from "@tanstack/react-query"
import axios from "axios"

// Get all SO #s
const getAllSOs = async () => {
    const { data } = await axios.get<Array<string>>(`${import.meta.env.VITE_API_BASE}/netsuite/sales-orders`)

    return data
}

export function useSOs() {
    return useQuery({ queryKey: ["SOs"], queryFn: getAllSOs })
}