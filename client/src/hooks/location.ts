import { useQuery } from "@tanstack/react-query"
import axios from "axios"

// Get all Locations
const getAllLocations = async () => {
    const { data } = await axios.get<Array<string>>(`${import.meta.env.VITE_API_BASE}/netsuite/locations`)

    return data
}

export function useLocations() {
    return useQuery({ queryKey: ["locations"], queryFn: getAllLocations })
}