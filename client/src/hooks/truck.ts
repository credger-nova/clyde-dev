import { useQuery } from "@tanstack/react-query"
import axios from "axios"

// Get all Truck #s
const getAllTrucks = async () => {
    const { data } = await axios.get<Array<string>>(`${import.meta.env.VITE_API_BASE}/netsuite/trucks`)

    return data
}

export function useTrucks() {
    return useQuery({ queryKey: ["trucks"], queryFn: getAllTrucks })
}