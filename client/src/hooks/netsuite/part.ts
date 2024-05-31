import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import { Part } from "../../types/netsuite/part"

// Get all Parts
const getAllParts = async (token: string) => {
    const { data } = await axios.get<Array<Part>>(`${import.meta.env.VITE_API_BASE}/netsuite/parts`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    return data
}

export function useParts(token: string) {
    return useQuery({ queryKey: ["parts"], queryFn: () => getAllParts(token), enabled: !!token })
}
