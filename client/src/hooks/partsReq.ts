import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { CreatePartsReq, PartsReq, UpdatePartsReq } from "../types/partsReq"

// Get all Parts Reqs
const getAllPartsReqs = async () => {
    const { data } = await axios.get<Array<PartsReq>>(`${import.meta.env.VITE_API_BASE}/forms/parts-req`)

    return data
}

export function usePartsReqs() {
    return useQuery({ queryKey: ["partsReq"], queryFn: getAllPartsReqs })
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
const createPartsReq = async (partsReq: CreatePartsReq) => {
    const { data } = await axios.post(`${import.meta.env.VITE_API_BASE}/forms/parts-req`, partsReq)

    return data
}

export function useCreatePartsReq() {
    const queryClient = useQueryClient()

    return useMutation({ mutationFn: createPartsReq, onSuccess: data => { queryClient.setQueryData(["partsReq"], data) } })
}

// Update Parts Req
const updatePartsReq = async (partsReq: Partial<UpdatePartsReq>) => {
    const { data } = await axios.put(`${import.meta.env.VITE_API_BASE}/forms/parts-req/${partsReq.id}`, partsReq)

    return data
}

export function useUpdatePartsReq() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updatePartsReq, onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partsReq"] })
        }
    })
}
