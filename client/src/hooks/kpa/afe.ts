import { AFE } from "../../types/kpa/afe"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"

// Get all AFE #s
const getAllAFEs = async (token: string) => {
    const { data } = await axios.get<Array<AFE>>(`${import.meta.env.VITE_API_BASE}/kpa/afe`,
        { headers: { Authorization: `Bearer ${token}` } })

    return data
}

export function useAFEs(token: string) {
    return useQuery({ queryKey: ["AFEs"], queryFn: () => getAllAFEs(token), enabled: !!token })
}