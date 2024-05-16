import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import { Truck } from "../../types/netsuite/truck"

// Get all Trucks
const getAllTrucks = async () => {
    const { data } = await axios.get<Array<Truck>>(`${import.meta.env.VITE_API_BASE}/netsuite/trucks`)

    return data
}

export function useTrucks() {
    return useQuery({ queryKey: ["trucks"], queryFn: getAllTrucks })
}