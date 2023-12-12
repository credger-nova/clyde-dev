import * as fs from "fs"
import * as path from "path"
import { parse } from "csv-parse"
import { Unit, Parameter, WeeklyDowntime } from "@prisma/client"
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

async function main() {
    /*
     * Seed Unit table
     */

    console.log("Seeding Unit Table")
    var csvFilePath = path.resolve(__dirname, "seeds/unit.csv")

    var headers = [
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

    var fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" })

    parse(fileContent, {
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
    }, async (error, result: Unit[]) => {
        if (error) {
            console.error(error)
        }

        for (const unit of result) {
            const createdUnit = await prisma.unit.upsert({
                where: { unitNumber: unit.unitNumber },
                update: unit,
                create: unit
            })
        }
    })

    /*
     * Seed Parameter table
     */

    console.log("Seeding Parameter Table")
    csvFilePath = path.resolve(__dirname, "seeds/parameter.csv")

    headers = [
        "unitNumber",
        "name",
        "value",
        "timestamp"
    ]

    fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" })

    parse(fileContent, {
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
    }, async (error, result: Parameter[]) => {
        if (error) {
            console.error(error)
        }

        for (const parameter of result) {
            const createdParameter = await prisma.parameter.upsert({
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
    })

    /*
     * Seed Weekly Downtime table
     */

    console.log("Seeding Weekly Downtime Table")
    csvFilePath = path.resolve(__dirname, "seeds/weekly_downtime.csv")

    headers = [
        "unitNumber",
        "week",
        "ma",
        "dtHours"
    ]

    fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" })

    parse(fileContent, {
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
    }, async (error, result: WeeklyDowntime[]) => {
        if (error) {
            console.error(error)
        }

        for (const weeklyDowntime of result) {
            const createdWeeklyDowntime = await prisma.weeklyDowntime.upsert({
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
    })
}

main().then(async () => {
    await prisma.$disconnect()
}).catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
})