import { NovaUser } from "../../models/novaUser"
import { LEAD_MECHANICS } from "../../utils/lead-mechanics"
import { TITLES } from "../../utils/titles"

import { prisma } from "../../utils/prisma-client"

const SUPPLY_CHAIN_TITLES = TITLES.find(item => item.group === "Supply Chain")?.titles ?? []
const SC_MANAGEMENT_TITLES = TITLES.find(item => item.group === "Supply Chain Management")?.titles ?? []

// Function to cast user to NovaUser
export function convertUser(user: any) {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        cellPhone: user.cellPhone,
        terminationDate: user.terminationDate ?? undefined,
        jobTitle: user.jobTitle,
        region: user.region.split(","),
        supervisorId: user.supervisorId,
        managerId: user.managerId
    } as NovaUser
}

export const getAllEmployees = async (inactive?: "true") => {
    const employees = await prisma.user.findMany({
        where: {
            ...(inactive !== "true" ? { terminationDate: null } : {})
        },
        orderBy: [
            {
                firstName: "asc"
            },
            {
                lastName: "asc"
            }
        ]
    })

    // Convert to correct type
    let novaEmployees = employees.map((employee) => {
        return convertUser(employee)
    })

    return novaEmployees
}

// Get single employee by email
export const getEmployee = async (email: string) => {
    const employee = await prisma.user.findFirst({
        where: {
            email: email
        }
    })

    if (employee) {
        // Convert to correct type
        const novaEmployee = convertUser(employee)

        return novaEmployee
    } else {
        return null
    }
}

// Get employees under a lead
export const getLeadsEmployees = async (id: string) => {
    // Get list of ids of lead's subordinates
    const ids = LEAD_MECHANICS.find((group) => group.leads.includes(id))?.mechanics.map((mechanic) => mechanic.id)

    const employees = await prisma.user.findMany({
        where: {
            id: { in: ids ?? [] }
        },
        orderBy: [
            {
                firstName: "asc"
            },
            {
                lastName: "asc"
            }
        ]
    })

    // Convert to correct type
    let novaEmployees = employees.map((employee) => {
        return convertUser(employee)
    })

    return novaEmployees
}

// Get an employee's manager
export const getEmployeesManager = async (managerId: string) => {
    const employee = await prisma.user.findUnique({
        where: {
            id: managerId
        }
    })

    return convertUser(employee)
}

// Get employees under a manager
export const getManagersEmployees = async (id: string, inactive?: "true") => {
    const employees = await prisma.user.findMany({
        where: {
            AND: [
                {
                    supervisorId: id
                },
                {
                    ...(inactive !== "true" ? { terminationDate: null } : {})
                }
            ]
        },
        orderBy: [
            {
                firstName: "asc"
            },
            {
                lastName: "asc"
            }
        ]
    })

    // Convert to correct type
    let novaEmployees = employees.map((employee) => {
        return convertUser(employee)
    })

    return novaEmployees
}

// Get an employee's director
export const getEmployeesDirector = async (directorId: string) => {
    const employee = await prisma.user.findUnique({
        where: {
            id: directorId
        }
    })

    return convertUser(employee)
}

// Get employees under a director
export const getDirectorsEmployees = async (id: string, inactive?: "true") => {
    const employees = await prisma.user.findMany({
        where: {
            AND: [
                {
                    OR:
                        [
                            {
                                supervisorId: id
                            },
                            {
                                managerId: id
                            }
                        ]
                },
                {
                    ...(inactive !== "true" ? { terminationDate: null } : {})
                }
            ]
        },
        orderBy: [
            {
                firstName: "asc"
            },
            {
                lastName: "asc"
            }
        ]
    })

    // Convert to correct type
    let novaEmployees = employees.map((employee) => {
        return convertUser(employee)
    })

    return novaEmployees
}

// Get regional supply chain employees
export const getRegionalSupplyChain = async (region: string) => {
    let allEmployees = await getAllEmployees()

    // Filter out test accounts
    allEmployees = allEmployees.filter((employee) => employee.firstName !== "Test")

    const scEmployees = allEmployees.filter((employee) =>
        employee.region.includes(region) && (SUPPLY_CHAIN_TITLES.includes(employee.jobTitle) && employee.jobTitle !== "Parts Runner - Supply Chain")
    )

    return scEmployees
}

// Get supply chain management employees
export const getSupplyChainManagement = async () => {
    let employees = await prisma.user.findMany({
        where: {
            jobTitle: {
                in: SC_MANAGEMENT_TITLES
            }
        }
    })

    // Filter out test accounts
    employees = employees.filter((employee) => employee.firstName !== "Test")

    // Convert to correct type
    let novaEmployees = employees.map((employee) => {
        return convertUser(employee)
    })

    return novaEmployees
}

// Get regional parts runners
export const getRegionalPartsRunners = async (region: string) => {
    const allEmployees = await getAllEmployees()

    const partsRunners = allEmployees.filter((employee) =>
        employee.region.includes(region) && employee.jobTitle === "Parts Runner - Supply Chain"
    )

    return partsRunners
}