import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import { Truck } from "../../types/netsuite/truck"

// Get all Trucks
const getAllTrucks = async (token: string) => {
    const { data } = await axios.get<Array<Truck>>(`${import.meta.env.VITE_API_BASE}/netsuite/trucks`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    return data
}

export function useTrucks(token: string) {
    return useQuery({ queryKey: ["trucks"], queryFn: () => getAllTrucks(token), enabled: !!token })
}
