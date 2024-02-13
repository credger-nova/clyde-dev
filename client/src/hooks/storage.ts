import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

// Upload file(s)
const uploadFiles = async ({ formData }: { formData: FormData }) => {
    const { data } = await axios.post(`${import.meta.env.VITE_API_BASE}/storage`, formData)

    return data
}

export function useUploadFiles() {
    return useMutation({ mutationFn: uploadFiles, onSuccess: (data) => console.log(data) })
}

// Download file
const downloadFile = async ({ bucket, fileName }: { bucket: string, fileName: string }) => {
    // Get signed URL
    const { data: signedURL } = await axios.get<string>(`${import.meta.env.VITE_API_BASE}/storage/${bucket}/${fileName}`)

    await axios.get(signedURL)
}

export function useDownloadFile() {
    return useMutation({ mutationFn: downloadFile })
}

// Get file stream
const getFileStream = async ({ bucket, fileName }: { bucket: string, fileName: string }) => {
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE}/storage/download/${bucket}/${fileName}`)

    return data
}

export function useGetFileStream() {
    return useMutation({ mutationFn: getFileStream })
}

const softDeleteFile = async ({ id }: { id: string }) => {
    const { data } = await axios.delete(`${import.meta.env.VITE_API_BASE}/storage/${id}`)

    return data
}

export function useSoftDeleteFile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: softDeleteFile, onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partsReq"] })
        }
    })
}