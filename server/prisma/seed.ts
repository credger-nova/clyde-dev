import { parse } from "csv-parse"
import fs from "node:fs"
import { prisma } from "../src/utils/prisma-client"

const NUM_COLS = [
    "oemHP",
    "novaHP",
    "engineRPM",
    "frameRPM",
    "monthlyRate",
    "recurringDiscount",
    "salesTax",
    "adValoremHeit",
    "netRevenue",
    "ma",
    "dtHours"
]
const DATE_COLS = [
    "packageMfgDate",
    "engineMfgDate",
    "zeroHourDate",
    "compressorFrameRebuild",
    "topEnd",
    "unitSetDate",
    "billingStartDate",
    "billingEndDate",
    "lastBillingDate",
    "acqEffDate",
    "unitProfileUpdateDate",
    "timestamp"
]

const seedUnit = async () => {
    console.log("Seeding Unit Table")

    const headers = [
        "status",
        "unitNumber",
        "customer",
        "location",
        "county",
        "state",
        "engine",
        "engineFamily",
        "engineSerialNum",
        "afr",
        "catalyst",
        "catalystMM",
        "oemHP",
        "novaHP",
        "engineRPM",
        "frameRPM",
        "compressorFrame",
        "compressorFrameFamily",
        "compressorFrameSN",
        "stages",
        "cylinderSize",
        "packageMfgDate",
        "engineMfgDate",
        "zeroHourDate",
        "compressorFrameRebuild",
        "topEnd",
        "oilProvider",
        "telemetry",
        "coordinates",
        "trailerUnit",
        "unitSetDate",
        "billingStartDate",
        "billingEndDate",
        "lastBillingDate",
        "onOffContract",
        "mtmLastPriceIncrease",
        "salesperson",
        "contractTypeTax",
        "contractTypeOil",
        "monthlyRate",
        "recurringDiscount",
        "salesTax",
        "adValoremHeit",
        "netRevenue",
        "dayRate",
        "origin",
        "acqEffDate",
        "ownedLeased",
        "operationalRegion",
        "financeRegion",
        "unitProfileUpdateDate",
        "financialSku",
        "oemHPTranche",
        "bdComments",
        "opsComments",
        "setWeek",
        "releaseWeek",
    ]

    const parser = fs
        .createReadStream(`${__dirname}/seeds/unit.csv`)
        .pipe(parse({
            delimiter: ",",
            columns: headers,
            from: 2,
            cast: (value, context) => {
                if (value !== "NULL") {
                    if (NUM_COLS.includes(context.column as string)) {
                        return Number(value)
                    } else if (DATE_COLS.includes(context.column as string)) {
                        return new Date(value)
                    } else {
                        return value
                    }
                } else {
                    return null
                }
            }
        }))

    for await (const unit of parser) {
        await prisma.unit.upsert({
            where: { unitNumber: unit.unitNumber },
            update: unit,
            create: unit
        })
    }

    console.log("Unit Table Seeding Complete")
}

const seedParameter = async () => {
    console.log("Seeding Parameter Table")

    const headers = [
        "unitNumber",
        "name",
        "value",
        "timestamp"
    ]

    const parser = fs
        .createReadStream(`${__dirname}/seeds/parameter.csv`)
        .pipe(parse({
            delimiter: ",",
            columns: headers,
            from: 2,
            cast: (value, context) => {
                if (value !== "NULL") {
                    if (NUM_COLS.includes(context.column as string)) {
                        return Number(value)
                    } else if (DATE_COLS.includes(context.column as string)) {
                        return new Date(value)
                    } else {
                        return value
                    }
                } else {
                    return null
                }
            }
        }))

    for await (const parameter of parser) {
        await prisma.parameter.upsert({
            where: {
                unitNumber_name: {
                    unitNumber: parameter.unitNumber,
                    name: parameter.name
                }
            },
            update: parameter,
            create: parameter
        })
    }

    console.log("Parameter Table Seeding Complete")
}

const seedWeeklyDowntime = async () => {
    console.log("Seeding Weekly Downtime Table")

    const headers = [
        "unitNumber",
        "week",
        "ma",
        "dtHours"
    ]

    const parser = fs
        .createReadStream(`${__dirname}/seeds/weekly_downtime.csv`)
        .pipe(parse({
            delimiter: ",",
            columns: headers,
            from: 2,
            cast: (value, context) => {
                if (value !== "NULL") {
                    if (NUM_COLS.includes(context.column as string)) {
                        return Number(value)
                    } else if (DATE_COLS.includes(context.column as string)) {
                        return new Date(value)
                    } else {
                        return value
                    }
                } else {
                    return null
                }
            }
        }))

    for await (const weeklyDowntime of parser) {
        await prisma.weeklyDowntime.upsert({
            where: {
                unitNumber_week: {
                    unitNumber: weeklyDowntime.unitNumber,
                    week: weeklyDowntime.week
                }
            },
            update: weeklyDowntime,
            create: weeklyDowntime
        })
    }

    console.log("Weekly Downtime Table Seeding Complete")
}

async function main() {
    await seedUnit()
    await seedParameter()
    await seedWeeklyDowntime()

    await prisma.$disconnect()
}

main()