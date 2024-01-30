import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { UnitStatus } from "../types/unit"

// Get all unit statuses
const getAllStatuses = async () => {
    const { data } = await axios.get<Array<UnitStatus>>(`${import.meta.env.VITE_API_BASE}/parameter/status`)

    return data
}

export function useStatuses() {
    return useQuery({ queryKey: ["statuses"], queryFn: getAllStatuses })
}