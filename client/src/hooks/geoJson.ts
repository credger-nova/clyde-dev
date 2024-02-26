import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { GeoJSONLayer } from "../types/geoJson"

// Get GeoJSON layer for unit locations
const getUnitsLayer = async (manager?: string) => {
    const { data } = await axios.get<GeoJSONLayer>(`${import.meta.env.VITE_API_BASE}/unit/geojson/${manager ?? ""}`)

    return data
}

export function useUnitsLayer(manager?: string) {
    return useQuery({ queryKey: ["unitsLayer"], queryFn: () => getUnitsLayer(manager) })
}

// Get centroid for GeoJSON point layer
const getCentroid = async (layer: GeoJSONLayer) => {
    const { data } = await axios.post<Array<number>>(`${import.meta.env.VITE_API_BASE}/unit/geojson/centroid`, { features: layer.features })

    return data
}

export function useCentroid(layer: GeoJSONLayer | undefined, layerFetching: boolean) {
    return useQuery({ queryKey: ["centroid"], queryFn: () => getCentroid(layer!), enabled: !layerFetching })
}