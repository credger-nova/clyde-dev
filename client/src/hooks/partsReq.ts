import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { PartsReq } from "../types/partsReq"

// Get all Parts Reqs
const getAllPartsReqs = async () => {
    const { data } = await axios.get<Array<PartsReq>>(`${import.meta.env.VITE_API_BASE}/forms/parts-req`)

    return data
}

export function usePartsReqs() {
    return useQuery({ queryKey: ["partsReqs"], queryFn: getAllPartsReqs })
}

// Get single Parts Req
const getPartsReq = async (id: string) => {
    const { data } = await axios.get<PartsReq>(`${import.meta.env.VITE_API_BASE}/forms/parts-req/${id}`)

    return data
}

export function usePartsReq(id: string) {
    return useQuery({ queryKey: ["partsReq", id], queryFn: () => getPartsReq(id) })
}

// Create Parts Req
export const createPartsReq = async (partsReq: Omit<PartsReq, "id">) => {
    const { data } = await axios.post(`${import.meta.env.VITE_API_BASE}/forms/parts-req`, partsReq)

    return data
}
