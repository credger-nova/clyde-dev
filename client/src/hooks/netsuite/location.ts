import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import { Location } from "../../types/netsuite/location"

// Get all NetSuite Locations
const getAllLocations = async (token: string) => {
    const { data } = await axios.get<Array<Location>>(`${import.meta.env.VITE_API_BASE}/netsuite/locations`,
        { headers: { Authorization: `Bearer ${token}` } }
    )

    return data
}

export function useLocations(token: string) {
    return useQuery({ queryKey: ["locations"], queryFn: () => getAllLocations(token), enabled: !!token })
}