import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Unit } from "../types/unit"

// Get all Unit #s
const getAllUnits = async () => {
    const { data } = await axios.get<Array<Unit>>(`${import.meta.env.VITE_API_BASE}/unit`)

    return data
}

export function useUnits() {
    return useQuery({ queryKey: ["units"], queryFn: getAllUnits })
}