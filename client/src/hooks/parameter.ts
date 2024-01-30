import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { UnitStatus } from "../types/unit"
import { API_BASE } from "../utils/globals"

// Get all unit statuses
const getAllStatuses = async () => {
    const { data } = await axios.get<Array<UnitStatus>>(`${API_BASE}/parameter/status`)

    return data
}

export function useStatuses() {
    return useQuery({ queryKey: ["statuses"], queryFn: getAllStatuses })
}