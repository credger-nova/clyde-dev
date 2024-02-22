import { useQuery } from "@tanstack/react-query"
import axios from "axios"

// Get GeoJSON layer for unit locations
const getUnitsLayer = async () => {
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE}/unit/geojson`)

    return data
}

export function useUnitsLayer() {
    return useQuery({ queryKey: ["unitsLayer"], queryFn: getUnitsLayer })
}