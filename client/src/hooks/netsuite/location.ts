import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import { Location } from "../../types/netsuite/location"

// Get all NetSuite Locations
const getAllLocations = async () => {
    const { data } = await axios.get<Array<Location>>(`${import.meta.env.VITE_API_BASE}/netsuite/locations`)

    return data
}

export function useWarehouses() {
    return useQuery({ queryKey: ["warehouses"], queryFn: getAllLocations })
}