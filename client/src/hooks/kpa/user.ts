import { NovaUser } from "../../types/kpa/novaUser"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"

// Get user by id or email
const getNovaUser = async (token: string, email: string) => {
    const { data } = await axios.get<NovaUser>(`${import.meta.env.VITE_API_BASE}/kpa/employee/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    return data
}

export function useNovaUser(token: string, email: string | undefined) {
    return useQuery({
        queryKey: ["user", email],
        queryFn: () => getNovaUser(token, email!),
        enabled: email !== undefined && !!token,
    })
}

const getAllNovaUsers = async (token: string) => {
    const { data } = await axios.get<Array<NovaUser>>(`${import.meta.env.VITE_API_BASE}/kpa/employee/all`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    return data
}

export function useAllNovaUsers(token: string) {
    return useQuery({
        queryKey: ["users"],
        queryFn: () => getAllNovaUsers(token),
        enabled: !!token,
    })
}

// Get all lead's employees
const getLeadsEmployees = async (token: string, user: NovaUser) => {
    const { data } = await axios.get<Array<NovaUser>>(`${import.meta.env.VITE_API_BASE}/kpa/lead/${user.id}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    return data
}

export function useLeadsEmployees(token: string, user: NovaUser) {
    return useQuery({
        queryKey: ["employees", user.id],
        queryFn: () => getLeadsEmployees(token, user),
        enabled: user.jobTitle.includes("Lead") && !!token,
    })
}

// Get all manager's employees
const getManagersEmployees = async (token: string, user: NovaUser) => {
    const { data } = await axios.get<Array<NovaUser>>(`${import.meta.env.VITE_API_BASE}/kpa/manager/${user.id}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    return data
}

export function useManagersEmployees(token: string, user: NovaUser) {
    return useQuery({
        queryKey: ["employees", user.id],
        queryFn: () => getManagersEmployees(token, user),
        enabled: (user.jobTitle.includes("Manager") || user.jobTitle === "Supervisor - Shop") && !!token,
    })
}

// Get all director's employees
const getDirectorsEmployees = async (token: string, user: NovaUser) => {
    const { data } = await axios.get<Array<NovaUser>>(`${import.meta.env.VITE_API_BASE}/kpa/director/${user.id}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    return data
}

export function useDirectorsEmployees(token: string, user: NovaUser) {
    return useQuery({
        queryKey: ["employees", user.id],
        queryFn: () => getDirectorsEmployees(token, user),
        enabled: user.jobTitle.includes("Director") && !!token,
    })
}
