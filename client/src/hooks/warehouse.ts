import { useQuery } from "@tanstack/react-query"
import axios from "axios"

// Get all Warehouse/Conex Locations
const getAllWarehouses = async () => {
    const { data } = await axios.get<Array<string>>(`${import.meta.env.VITE_API_BASE}/netsuite/locations`)

    return data
}

export function useWarehouses() {
    return useQuery({ queryKey: ["warehouses"], queryFn: getAllWarehouses })
}