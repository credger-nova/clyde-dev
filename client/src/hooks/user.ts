import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { NovaUser } from "../types/novaUser"

// Get user by id or email
const getNovaUser = async (id?: string, email?: string) => {
    const url = new URL(`${import.meta.env.VITE_API_BASE}/kpa/employee`)
    id ? url.searchParams.append("id", id) : null
    email ? url.searchParams.append("email", email) : null

    const { data } = await axios.get<NovaUser>(url.toString())

    return data
}

export function useNovaUser(id?: string, email?: string) {
    return useQuery({
        queryKey: ["user", id || email],
        queryFn: () => getNovaUser(id, email),
        enabled: id !== undefined || email !== undefined
    })
}

const getAllNovaUsers = async () => {
    const { data } = await axios.get<Array<NovaUser>>(`${import.meta.env.VITE_API_BASE}/kpa/employee/all`)

    return data
}

export function useAllNovaUsers() {
    return useQuery({
        queryKey: ["users"],
        queryFn: getAllNovaUsers
    })
}

// Get all manager's employees
const getManagersEmployees = async (id: string) => {
    const { data } = await axios.get<Array<NovaUser>>(`${import.meta.env.VITE_API_BASE}/kpa/manager/${id}/employees`)

    return data
}

export function useManagersEmployees(id: string) {
    return useQuery({ queryKey: ["employees", id], queryFn: () => getManagersEmployees(id) })
}

// Get all director's employees
const getDirectorsEmployees = async (id: string) => {
    const { data } = await axios.get<Array<NovaUser>>(`${import.meta.env.VITE_API_BASE}/kpa/director/${id}/employees`)

    return data
}

export function useDirectorsEmployees(id: string) {
    return useQuery({ queryKey: ["employees", id], queryFn: () => getDirectorsEmployees(id) })
}