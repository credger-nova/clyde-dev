export interface NovaUser {
    id: string
    firstName: string
    lastName: string
    email: string
    cellPhone: string
    hireDate?: Date
    terminationDate?: Date
    jobTitle: string
    region: Array<string>
    rotator: boolean
    supervisorId: string
    managerId: string
}
