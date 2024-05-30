import { CreatePartsReq, PartsReq, PartsReqQuery, UpdatePartsReq } from "../types/partsReq"
import { NovaUser } from "../types/kpa/novaUser"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

// Get all Parts Reqs
const getAllPartsReqs = async (token: string, partsReqQuery: PartsReqQuery) => {
    const { data } = await axios.post(`${import.meta.env.VITE_API_BASE}/forms/parts-req`, partsReqQuery,
        { headers: { Authorization: `Bearer ${token}` } })

    return data as Array<PartsReq>
}

export function usePartsReqs(token: string, partsReqQuery: PartsReqQuery) {
    return useQuery({ queryKey: ["partsReq", partsReqQuery], queryFn: () => getAllPartsReqs(token, partsReqQuery), enabled: !!partsReqQuery.user && !!token })
}

// Get single Parts Req
const getPartsReq = async (token: string, id: number) => {
    const { data } = await axios.get<PartsReq>(`${import.meta.env.VITE_API_BASE}/forms/parts-req/${id}`,
        { headers: { Authorization: `Bearer ${token}` } })

    return data
}

export function usePartsReq(token: string, id: number) {
    return useQuery({ queryKey: ["partsReq", id], queryFn: () => getPartsReq(token, id), enabled: id !== null && !!token })
}

// Create Parts Req
const createPartsReq = async ({ token, partsReq }: { token: string, partsReq: CreatePartsReq }) => {
    const body = { partsReq: partsReq }

    const { data } = await axios.post<PartsReq>(`${import.meta.env.VITE_API_BASE}/forms/parts-req/create`, body,
        { headers: { Authorization: `Bearer ${token}` } })

    return data
}

export function useCreatePartsReq() {
    const queryClient = useQueryClient()

    return useMutation({ mutationFn: createPartsReq, onSuccess: data => { queryClient.setQueryData(["partsReq"], data) } })
}

// Update Parts Req
const updatePartsReq = async ({ token, user, updateReq }: { token: string, user: NovaUser, updateReq: Partial<UpdatePartsReq> }) => {
    const body = { user: user, updateReq: updateReq }

    const { data } = await axios.put<PartsReq>(`${import.meta.env.VITE_API_BASE}/forms/parts-req/${updateReq.id}`, body,
        { headers: { Authorization: `Bearer ${token}` } })

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
const generatePartsReqPDF = async ({ token, id, pricing }: { token: string, id: number, pricing: boolean }) => {
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE}/forms/parts-req/export/${id}${pricing ? '?pricing=true' : ''}`,
        {
            responseType: "arraybuffer",
            responseEncoding: "binary",
            headers:
            {
                "Accept": "*",
                "Content-Disposition": "attachment; filename=test.pdf",
                "Authorization": `Bearer ${token}`
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
const sumPrWithAfe = async (token: string, afeNumber: string) => {
    const { data } = await axios.get<number>(`${import.meta.env.VITE_API_BASE}/forms/parts-req/cost/${afeNumber}`,
        { headers: { Authorization: `Bearer ${token}` } })

    return data
}

export function useSumPrWithAfe(token: string, afeNumber: string) {
    return useQuery({ queryKey: ["AFE sum", afeNumber], queryFn: () => sumPrWithAfe(token, afeNumber), enabled: !!afeNumber && !!token })
}