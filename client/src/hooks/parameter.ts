import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { UnitStatus } from "../types/unit"

// Get all unit statuses
const getAllStatuses = async (token: string) => {
    const { data } = await axios.get<Array<UnitStatus>>(`${import.meta.env.VITE_API_BASE}/parameter/status`,
        { headers: { Authorization: `Bearer ${token}` } })

    return data
}

export function useStatuses(token: string) {
    return useQuery({ queryKey: ["statuses"], queryFn: () => getAllStatuses(token) })
}