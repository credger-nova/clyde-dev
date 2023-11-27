export interface Parameter {
    unitNumber: string,
    name: string,
    parameter: string,
    timestamp: Date
}

export interface UnitStatus {
    unitNumber: string,
    status: string,
    statusMessage: string,
    timestamp: Date
}