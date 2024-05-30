import { NovaUser } from "../../types/kpa/novaUser"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"

// Get user by id or email
const getNovaUser = async (email: string) => {
    const { data } = await axios.get<NovaUser>(`${import.meta.env.VITE_API_BASE}/kpa/employee/${email}`)

    return data
}

export function useNovaUser(email: string | undefined) {
    return useQuery({
        queryKey: ["user", email],
        queryFn: () => getNovaUser(email!),
        enabled: email !== undefined
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

// Get all lead's employees
const getLeadsEmployees = async (user: NovaUser) => {
    const { data } = await axios.get<Array<NovaUser>>(`${import.meta.env.VITE_API_BASE}/kpa/lead/${user.id}/employees`)

    return data
}

export function useLeadsEmployees(user: NovaUser) {
    return useQuery({ queryKey: ["employees", user.id], queryFn: () => getLeadsEmployees(user), enabled: user.jobTitle.includes("Lead") })
}

// Get all manager's employees
const getManagersEmployees = async (user: NovaUser) => {
    const { data } = await axios.get<Array<NovaUser>>(`${import.meta.env.VITE_API_BASE}/kpa/manager/${user.id}/employees`)

    return data
}

export function useManagersEmployees(user: NovaUser) {
    return useQuery({ queryKey: ["employees", user.id], queryFn: () => getManagersEmployees(user), enabled: user.jobTitle.includes("Manager") || user.jobTitle === "Supervisor - Shop" })
}

// Get all director's employees
const getDirectorsEmployees = async (user: NovaUser) => {
    const { data } = await axios.get<Array<NovaUser>>(`${import.meta.env.VITE_API_BASE}/kpa/director/${user.id}/employees`)

    return data
}

export function useDirectorsEmployees(user: NovaUser) {
    return useQuery({ queryKey: ["employees", user.id], queryFn: () => getDirectorsEmployees(user), enabled: user.jobTitle.includes("Director") })
}