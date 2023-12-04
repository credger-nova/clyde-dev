export interface Parameter {
    unitNumber: string,
    name: string,
    parameter: string,
    timestamp: Date
}

export interface UnitStatus {
    unitNumber: string,
    location: string,
    customer: string,
    engineFamily: string,
    status: string,
    statusMessage: string,
    telemetry: string,
    timestamp: Date
}