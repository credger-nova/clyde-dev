import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { CreatePartsReq, PartsReq } from "../types/partsReq"

// Get all Parts Reqs
const getAllPartsReqs = async () => {
    const { data } = await axios.get<Array<PartsReq>>(`${import.meta.env.VITE_API_BASE}/forms/parts-req`)

    return data
}

export function usePartsReqs() {
    return useQuery({ queryKey: ["partsReqs"], queryFn: getAllPartsReqs })
}

// Get single Parts Req
const getPartsReq = async (id: number) => {
    const { data } = await axios.get<PartsReq>(`${import.meta.env.VITE_API_BASE}/forms/parts-req/${id}`)

    return data
}

export function usePartsReq(id: number) {
    return useQuery({ queryKey: ["partsReq", id], queryFn: () => getPartsReq(id), enabled: id !== null })
}

// Create Parts Req
export const createPartsReq = async (partsReq: CreatePartsReq) => {
    const { data } = await axios.post(`${import.meta.env.VITE_API_BASE}/forms/parts-req`, partsReq)

    return data
}

// Update Parts Req
