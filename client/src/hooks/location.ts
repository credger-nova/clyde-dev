import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { API_BASE } from "../utils/globals"

// Get all Locations
const getAllLocations = async () => {
    const { data } = await axios.get<Array<string>>(`${API_BASE}/netsuite/locations`)

    return data
}

export function useLocations() {
    return useQuery({ queryKey: ["locations"], queryFn: getAllLocations })
}