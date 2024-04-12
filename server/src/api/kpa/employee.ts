import { NovaUser } from "../../models/novaUser"

import { prisma } from "../../utils/prisma-client"

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

export const getAllEmployees = async (active?: "true" | "false") => {
    const employees = await prisma.user.findMany({
        where: {
            ...(active === "true" ? { terminationDate: null } : {})
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

// Get employees under a manager
export const getManagersEmployees = async (id: string, active?: string) => {
    const employees = await prisma.user.findMany({
        where: {
            AND: [
                {
                    supervisorId: id
                },
                {
                    ...(active === "true" ? { terminationDate: null } : {})
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

// Get employees under a director
export const getDirectorsEmployees = async (id: string, active?: string) => {
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
                    ...(active === "true" ? { terminationDate: null } : {})
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