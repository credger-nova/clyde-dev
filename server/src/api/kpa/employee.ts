import { NovaUser } from "../../models/novaUser"

import { prisma } from "../../utils/prisma-client"

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
        return ({
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            cellPhone: employee.cellPhone,
            terminationDate: employee.terminationDate ?? undefined,
            jobTitle: employee.jobTitle,
            region: employee.region.split(","),
            supervisorId: employee.supervisorId,
            managerId: employee.managerId
        } as NovaUser)
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
        const novaEmployee = {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            cellPhone: employee.cellPhone,
            terminationDate: employee.terminationDate ?? undefined,
            jobTitle: employee.jobTitle,
            region: employee.region.split(","),
            supervisorId: employee.supervisorId,
            managerId: employee.managerId
        } as NovaUser

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
        return ({
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            cellPhone: employee.cellPhone,
            terminationDate: employee.terminationDate ?? undefined,
            jobTitle: employee.jobTitle,
            region: employee.region.split(","),
            supervisorId: employee.supervisorId,
            managerId: employee.managerId
        } as NovaUser)
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
        return ({
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            cellPhone: employee.cellPhone,
            terminationDate: employee.terminationDate ?? undefined,
            jobTitle: employee.jobTitle,
            region: employee.region.split(","),
            supervisorId: employee.supervisorId,
            managerId: employee.managerId
        } as NovaUser)
    })

    return novaEmployees
}