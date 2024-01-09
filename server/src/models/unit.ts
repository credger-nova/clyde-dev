export interface UnitStatus {
    unitNumber: string,
    location?: string,
    customer?: string,
    engineFamily?: string,
    status: string,
    statusMessage?: string,
    telemetry?: string,
    timestamp: Date
}