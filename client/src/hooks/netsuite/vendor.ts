import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import { Vendor } from "../../types/netsuite/vendor"

// Get all Vendors
const getAllVendors = async (token: string) => {
    const { data } = await axios.get<Array<Vendor>>(`${import.meta.env.VITE_API_BASE}/netsuite/vendors`,
        { headers: { Authorization: `Bearer ${token}` } })

    return data
}

export function useVendors(token: string) {
    return useQuery({ queryKey: ["vendors"], queryFn: () => getAllVendors(token), enabled: !!token })
}