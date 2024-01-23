export interface NovaUser {
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    title: string,
    region: Array<string>,
    supervisorId?: string,
    managerId?: string
}