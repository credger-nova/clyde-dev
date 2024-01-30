import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { API_BASE } from "../utils/globals"

// Get all AFE #s
const getAllAFEs = async () => {
    const { data } = await axios.get<Array<string>>(`${API_BASE}/kpa/afe`)

    return data
}

export function useAFEs() {
    return useQuery({ queryKey: ["AFEs"], queryFn: getAllAFEs })
}