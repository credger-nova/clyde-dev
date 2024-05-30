import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Unit } from "../types/unit"

// Get all Unit #s
const getAllUnits = async (token: string) => {
    const { data } = await axios.get<Array<Unit>>(`${import.meta.env.VITE_API_BASE}/unit`,
        { headers: { Authorization: `Bearer ${token}` } })

    return data
}

export function useUnits(token: string) {
    return useQuery({ queryKey: ["units"], queryFn: () => getAllUnits(token), enabled: !!token })
}

// Get Customers
const getAllCustomers = async (token: string) => {
    const { data } = await axios.get<Array<string>>(`${import.meta.env.VITE_API_BASE}/unit/customer`,
        { headers: { Authorization: `Bearer ${token}` } })

    return data
}

export function useCustomers(token: string) {
    return useQuery({ queryKey: ["customers"], queryFn: () => getAllCustomers(token), enabled: !!token })
}

// Get Locations
const getAllUnitLocations = async (token: string) => {
    const { data } = await axios.get<Array<string>>(`${import.meta.env.VITE_API_BASE}/unit/location`,
        { headers: { Authorization: `Bearer ${token}` } })

    return data
}

export function useUnitLocations(token: string) {
    return useQuery({ queryKey: ["unit locations"], queryFn: () => getAllUnitLocations(token), enabled: !!token })
}

// Get Regions
const getAllRegions = async (token: string) => {
    const { data } = await axios.get<Array<string>>(`${import.meta.env.VITE_API_BASE}/unit/region`,
        { headers: { Authorization: `Bearer ${token}` } })

    return data
}

export function useRegions(token: string) {
    return useQuery({ queryKey: ["regions"], queryFn: () => getAllRegions(token), enabled: !!token })
}

// Get Managers
const getAllManagers = async (token: string) => {
    const { data } = await axios.get<Array<string>>(`${import.meta.env.VITE_API_BASE}/unit/manager`,
        { headers: { Authorization: `Bearer ${token}` } })

    return data
}

export function useManagers(token: string) {
    return useQuery({ queryKey: ["managers"], queryFn: () => getAllManagers(token), enabled: !!token })
}