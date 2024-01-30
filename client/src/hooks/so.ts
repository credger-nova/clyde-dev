import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { API_BASE } from "../utils/globals"

// Get all SO #s
const getAllSOs = async () => {
    const { data } = await axios.get<Array<string>>(`${API_BASE}/netsuite/sales-orders`)

    return data
}

export function useSOs() {
    return useQuery({ queryKey: ["SOs"], queryFn: getAllSOs })
}