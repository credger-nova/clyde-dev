import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Part } from "../types/partsReq"
import { API_BASE } from "../utils/globals"

// Get all Parts
const getAllParts = async () => {
    const { data } = await axios.get<Array<Part>>(`${API_BASE}/netsuite/items`)

    return data
}

export function useParts() {
    return useQuery({ queryKey: ["parts"], queryFn: getAllParts })
}