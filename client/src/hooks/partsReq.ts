import { CreatePartsReq, PartsReq, PartsReqQuery, UpdatePartsReq } from "../types/partsReq"
import { NovaUser } from "../types/kpa/novaUser"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

// Get all Parts Reqs
const getAllPartsReqs = async (partsReqQuery: PartsReqQuery) => {
    const { data } = await axios.post(`${import.meta.env.VITE_API_BASE}/forms/parts-req`, partsReqQuery)

    return data as Array<PartsReq>
}

export function usePartsReqs(partsReqQuery: PartsReqQuery) {
    return useQuery({ queryKey: ["partsReq", partsReqQuery], queryFn: () => getAllPartsReqs(partsReqQuery), enabled: !!partsReqQuery.user })
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
const createPartsReq = async ({ partsReq }: { partsReq: CreatePartsReq }) => {
    const body = { partsReq: partsReq }

    const { data } = await axios.post<PartsReq>(`${import.meta.env.VITE_API_BASE}/forms/parts-req/create`, body)

    return data
}

export function useCreatePartsReq() {
    const queryClient = useQueryClient()

    return useMutation({ mutationFn: createPartsReq, onSuccess: data => { queryClient.setQueryData(["partsReq"], data) } })
}

// Update Parts Req
const updatePartsReq = async ({ user, updateReq }: { user: NovaUser, updateReq: Partial<UpdatePartsReq> }) => {
    const body = { user: user, updateReq: updateReq }

    const { data } = await axios.put<PartsReq>(`${import.meta.env.VITE_API_BASE}/forms/parts-req/${updateReq.id}`, body)

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

// Generate PDF for a Parts Req
const generatePartsReqPDF = async ({ id, pricing }: { id: number, pricing: boolean }) => {
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE}/forms/parts-req/export/${id}${pricing ? '?pricing=true' : ''}`,
        {
            responseType: "arraybuffer",
            responseEncoding: "binary",
            headers:
            {
                "Accept": "*",
                "Content-Disposition": "attachment; filename=test.pdf"
            }
        })

    return data
}

export function useGeneratePDF() {
    return useMutation({
        mutationFn: generatePartsReqPDF, onSuccess: data => {
            const blob = new Blob([data], { type: "application/pdf" })

            const url = URL.createObjectURL(blob)

            window.open(url)
        }
    })
}

// Get sum of PR costs with an associated AFE #
const sumPrWithAfe = async (afeNumber: string) => {
    const { data } = await axios.get<number>(`${import.meta.env.VITE_API_BASE}/forms/parts-req/cost/${afeNumber}`)

    return data
}

export function useSumPrWithAfe(afeNumber: string) {
    return useQuery({ queryKey: ["AFE sum", afeNumber], queryFn: () => sumPrWithAfe(afeNumber), enabled: !!afeNumber })
}