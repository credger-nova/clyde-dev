import { AFE } from "../../types/kpa/afe"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"

// Get all AFE #s
const getAllAFEs = async () => {
    const { data } = await axios.get<Array<AFE>>(`${import.meta.env.VITE_API_BASE}/kpa/afe`)

    return data
}

export function useAFEs() {
    return useQuery({ queryKey: ["AFEs"], queryFn: getAllAFEs })
}