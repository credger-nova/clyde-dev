import { useQuery } from "@tanstack/react-query"
import axios from "axios"

// Get all AFE #s
const getAllAFEs = async () => {
    const { data } = await axios.get<Array<string>>(`${import.meta.env.VITE_API_BASE}/kpa/afe`)

    return data
}

export function useAFEs() {
    return useQuery({ queryKey: ["AFEs"], queryFn: getAllAFEs })
}

// Get AFE amount
const getAFEAmount = async (afeNumber: string | null) => {
    const { data } = await axios.get<number>(`${import.meta.env.VITE_API_BASE}/kpa/afe/cost/${afeNumber}`)

    return data
}

export function useAFEAmount(afeNumber: string | null) {
    return useQuery({ queryKey: ["AFE Amount", afeNumber], queryFn: () => getAFEAmount(afeNumber), enabled: !!afeNumber })
}