import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { GeoJSONLayer } from "../types/geoJson"

// Get GeoJSON layer for unit locations
const getUnitsLayer = async (token: string, manager?: string) => {
    const { data } = await axios.get<GeoJSONLayer>(`${import.meta.env.VITE_API_BASE}/unit/geojson/${manager ?? ""}`,
        { headers: { Authorization: `Bearer ${token}` } })

    return data
}

export function useUnitsLayer(token: string, manager?: string) {
    return useQuery({ queryKey: ["unitsLayer"], queryFn: () => getUnitsLayer(token, manager), enabled: !!token })
}

// Get centroid for GeoJSON point layer
const getCentroid = async (token: string, layer: GeoJSONLayer) => {
    const { data } = await axios.post<Array<number>>(`${import.meta.env.VITE_API_BASE}/unit/geojson/centroid`, { features: layer.features },
        { headers: { Authorization: `Bearer ${token}` } })

    return data
}

export function useCentroid(token: string, layer: GeoJSONLayer | undefined, layerFetching: boolean) {
    return useQuery({ queryKey: ["centroid"], queryFn: () => getCentroid(token, layer!), enabled: !layerFetching && !!token })
}