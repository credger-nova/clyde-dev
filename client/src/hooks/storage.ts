import { useMutation } from "@tanstack/react-query"
import axios from "axios"

// Upload file(s)
const uploadFiles = async ({ token, formData }: { token: string, formData: FormData }) => {
    const { data } = await axios.post(`${import.meta.env.VITE_API_BASE}/storage`, formData,
        { headers: { Authorization: `Bearer ${token}` } })

    return data
}

export function useUploadFiles() {
    return useMutation({ mutationFn: uploadFiles, onSuccess: (data) => console.log(data) })
}

// Get a signed URL so the user can access the file directly from Cloud Storage
const getSignedURL = async ({ token, bucket, fileName }: { token: string, bucket: string, fileName: string }) => {
    const { data } = await axios.get<{ signedURL: string }>(`${import.meta.env.VITE_API_BASE}/storage/${bucket}/${fileName}`,
        { headers: { Authorization: `Bearer ${token}` } })

    return data.signedURL
}

export function useGetSignedURL() {
    return useMutation({ mutationFn: getSignedURL })
}