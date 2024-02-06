import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { FileDownloadQuery } from "../types/file"

// Generate signed URL for given resource
const generateSignedURL = async (fileQuery: FileDownloadQuery) => {
    const { data } = await axios.post<string>(`${import.meta.env.VITE_API_BASE}/storage/download`, fileQuery)

    return data
}

export function useGenerateSignedURL() {
    return useMutation({ mutationFn: generateSignedURL })
}