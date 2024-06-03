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
    "dtHours",
    "cost",
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
    "timestamp",
    "terminationDate",
]

const BOOLEAN_COLS = ["active"]

const seedAfe = async () => {
    console.log("Seeding AFE Table")

    const headers = ["id", "number", "unitNumber", "amount"]

    const parser = fs.createReadStream(`${__dirname}/seeds/afe.csv`).pipe(
        parse({
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
            },
        })
    )

    for await (const afe of parser) {
        await prisma.aFE.upsert({
            where: { id: afe.id },
            update: afe,
            create: afe,
        })
    }

    console.log("AFE Table Seeding Complete")
}

const seedLocation = async () => {
    console.log("Seeding Location Table")

    const headers = ["id", "name"]

    const parser = fs.createReadStream(`${__dirname}/seeds/location.csv`).pipe(
        parse({
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
            },
        })
    )

    for await (const location of parser) {
        await prisma.location.upsert({
            where: { id: location.id },
            update: location,
            create: location,
        })
    }

    console.log("Location Table Seeding Complete")
}

const seedPart = async () => {
    console.log("Seeding Part Table")

    const headers = ["id", "itemNumber", "description", "cost", "mode", "type", "active"]

    const parser = fs.createReadStream(`${__dirname}/seeds/part.csv`).pipe(
        parse({
            delimiter: ",",
            columns: headers,
            from: 2,
            cast: (value, context) => {
                if (value !== "NULL") {
                    if (NUM_COLS.includes(context.column as string)) {
                        return Number(value)
                    } else if (DATE_COLS.includes(context.column as string)) {
                        return new Date(value)
                    } else if (BOOLEAN_COLS.includes(context.column as string)) {
                        return value === "True" ? true : false
                    } else {
                        return value
                    }
                } else {
                    return null
                }
            },
        })
    )

    for await (const part of parser) {
        await prisma.part.upsert({
            where: { id: part.id },
            update: part,
            create: part,
        })
    }

    console.log("Part Table Seeding Complete")
}

const seedSalesOrder = async () => {
    console.log("Seeding Sales Order Table")

    const headers = ["id", "number", "status"]

    const parser = fs.createReadStream(`${__dirname}/seeds/sales_order.csv`).pipe(
        parse({
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
            },
        })
    )

    for await (const salesOrder of parser) {
        await prisma.salesOrder.upsert({
            where: { id: salesOrder.id },
            update: salesOrder,
            create: salesOrder,
        })
    }

    console.log("Sales Order Table Seeding Complete")
}

const seedTruck = async () => {
    console.log("Seeding Truck Table")

    const headers = ["id", "name", "altName"]

    const parser = fs.createReadStream(`${__dirname}/seeds/truck.csv`).pipe(
        parse({
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
            },
        })
    )

    for await (const truck of parser) {
        await prisma.truck.upsert({
            where: { id: truck.id },
            update: truck,
            create: truck,
        })
    }

    console.log("Truck Table Seeding Complete")
}

const seedUser = async () => {
    console.log("Seeding User Table")

    const headers = ["id", "firstName", "lastName", "email", "cellPhone", "jobTitle", "region", "managerId", "supervisorId", "terminationDate"]

    const parser = fs.createReadStream(`${__dirname}/seeds/user.csv`).pipe(
        parse({
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
            },
        })
    )

    // Initial upsert of users (without manager or supervisor id)
    for await (const user of parser) {
        await prisma.user.upsert({
            where: { id: user.id },
            update: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                cellPhone: user.cellPhone,
                jobTitle: user.jobTitle,
                region: user.region,
                terminationDate: user.terminationDate,
            },
            create: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                cellPhone: user.cellPhone,
                jobTitle: user.jobTitle,
                region: user.region,
                terminationDate: user.terminationDate,
            },
        })
    }

    // Add manager and supervisor IDs
    const secondParser = fs.createReadStream(`${__dirname}/seeds/user.csv`).pipe(
        parse({
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
            },
        })
    )

    for await (const user of secondParser) {
        await prisma.user.upsert({
            where: { id: user.id },
            update: {
                managerId: user.managerId,
                supervisorId: user.supervisorId,
            },
            create: user,
        })
    }

    console.log("User Table Seeding Complete")
}

const seedVendor = async () => {
    console.log("Seeding Vendor Table")

    const headers = ["id", "name", "active"]

    const parser = fs.createReadStream(`${__dirname}/seeds/vendor.csv`).pipe(
        parse({
            delimiter: ",",
            columns: headers,
            from: 2,
            cast: (value, context) => {
                if (value !== "NULL") {
                    if (NUM_COLS.includes(context.column as string)) {
                        return Number(value)
                    } else if (DATE_COLS.includes(context.column as string)) {
                        return new Date(value)
                    } else if (BOOLEAN_COLS.includes(context.column as string)) {
                        return value === "True" ? true : false
                    } else {
                        return value
                    }
                } else {
                    return null
                }
            },
        })
    )

    for await (const vendor of parser) {
        await prisma.vendor.upsert({
            where: { id: vendor.id },
            update: vendor,
            create: vendor,
        })
    }

    console.log("Vendor Table Seeding Complete")
}

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
        "assignedTechnician",
        "assignedManager",
        "assignedDirector",
    ]

    const parser = fs.createReadStream(`${__dirname}/seeds/unit.csv`).pipe(
        parse({
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
            },
        })
    )

    for await (const unit of parser) {
        await prisma.unit.upsert({
            where: { unitNumber: unit.unitNumber },
            update: unit,
            create: unit,
        })
    }

    console.log("Unit Table Seeding Complete")
}

const seedParameter = async () => {
    console.log("Seeding Parameter Table")

    const headers = ["unitNumber", "name", "value", "timestamp"]

    const parser = fs.createReadStream(`${__dirname}/seeds/parameter.csv`).pipe(
        parse({
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
            },
        })
    )

    for await (const parameter of parser) {
        await prisma.parameter.upsert({
            where: {
                unitNumber_name: {
                    unitNumber: parameter.unitNumber,
                    name: parameter.name,
                },
            },
            update: parameter,
            create: parameter,
        })
    }

    console.log("Parameter Table Seeding Complete")
}

const seedWeeklyDowntime = async () => {
    console.log("Seeding Weekly Downtime Table")

    const headers = ["unitNumber", "week", "ma", "dtHours"]

    const parser = fs.createReadStream(`${__dirname}/seeds/weekly_downtime.csv`).pipe(
        parse({
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
            },
        })
    )

    for await (const weeklyDowntime of parser) {
        await prisma.weeklyDowntime.upsert({
            where: {
                unitNumber_week: {
                    unitNumber: weeklyDowntime.unitNumber,
                    week: weeklyDowntime.week,
                },
            },
            update: weeklyDowntime,
            create: weeklyDowntime,
        })
    }

    console.log("Weekly Downtime Table Seeding Complete")
}

async function main() {
    await seedUnit()

    await seedAfe()
    await seedLocation()
    await seedPart()
    await seedSalesOrder()
    await seedTruck()
    await seedUser()
    await seedVendor()

    await seedParameter()
    await seedWeeklyDowntime()

    await prisma.$disconnect()
}

main()
