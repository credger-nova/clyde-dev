import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import { Vendor } from "../../types/netsuite/vendor"

// Get all Vendors
const getAllVendors = async () => {
    const { data } = await axios.get<Array<Vendor>>(`${import.meta.env.VITE_API_BASE}/netsuite/vendors`)

    return data
}

export function useVendors() {
    return useQuery({ queryKey: ["vendors"], queryFn: getAllVendors })
}