import { Unit } from "@prisma/client";

export interface AFE {
    id: string,
    number: string,
    amount: string,
    unit: Unit
}