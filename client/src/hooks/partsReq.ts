import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { CreatePartsReq, PartsReq, PartsReqQuery, UpdatePartsReq } from "../types/partsReq"

// Get all Parts Reqs
const getAllPartsReqs = async (partsReqQuery: PartsReqQuery) => {
    const { data } = await axios.post(`${import.meta.env.VITE_API_BASE}/forms/parts-req`, partsReqQuery)

    return data as Array<PartsReq>
}

export function usePartsReqs(partsReqQuery: PartsReqQuery) {
    return useQuery({ queryKey: ["partsReq", partsReqQuery], queryFn: () => getAllPartsReqs(partsReqQuery) })
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
    const { data } = await axios.post(`${import.meta.env.VITE_API_BASE}/forms/parts-req/create`, partsReq)

    return data
}

export function useCreatePartsReq() {
    const queryClient = useQueryClient()

    return useMutation({ mutationFn: createPartsReq, onSuccess: data => { queryClient.setQueryData(["partsReq"], data) } })
}

// Update Parts Req
const updatePartsReq = async ({ user, updateReq }: { user: string, updateReq: Partial<UpdatePartsReq> }) => {
    const body = { user: user, updateReq: updateReq }

    const { data } = await axios.put(`${import.meta.env.VITE_API_BASE}/forms/parts-req/${updateReq.id}`, body)

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
