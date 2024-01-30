import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { API_BASE } from "../utils/globals"

// Get all Truck #s
const getAllTrucks = async () => {
    const { data } = await axios.get<Array<string>>(`${API_BASE}/netsuite/trucks`)

    return data
}

export function useTrucks() {
    return useQuery({ queryKey: ["trucks"], queryFn: getAllTrucks })
}