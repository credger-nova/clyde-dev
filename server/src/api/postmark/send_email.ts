import { PrEmailParams } from "../../models/email"
import { PartsReq } from "../../models/partsReq"
import { TITLES } from "../../utils/titles"

import dotenv from "dotenv"
import { calcCost, getPartsReqComments } from "../forms"
import { postmarkClient } from "../../utils/postmark/postmark-client"
import { getEmployeesDirector, getEmployeesManager, getRegionalSupplyChain, getSupplyChainManagement, getRegionalPartsRunners } from "../kpa/employee"

dotenv.config()

const FIELD_SHOP_SERVICE_TITLES = TITLES.filter((item) => item.group === "Field Service" || item.group === "Shop Service")
    .map((group) => group.titles)
    .flat()
const OPS_SHOP_MANAGER_TITLES = TITLES.filter((item) => item.group === "Ops Manager" || item.group === "Shop Supervisor")
    .map((group) => group.titles)
    .flat()
const OPS_SHOP_DIRECTOR_TITLES = TITLES.filter((item) => item.group === "Ops Director" || item.group === "Shop Director")
    .map((group) => group.titles)
    .flat()
const OPS_VP_TITLES = TITLES.find((item) => item.group === "Ops Vice President")?.titles ?? []
const EMISSIONS_MANAGER_TITLES = TITLES.find((item) => item.group === "Emissions Manager")?.titles ?? []
const SUPPLY_CHAIN_TITLES = TITLES.find((item) => item.group === "Supply Chain")?.titles ?? []
const SC_MANAGEMENT_TITLES = TITLES.find((item) => item.group === "Supply Chain Management")?.titles ?? []
const ADMIN_TITLES = TITLES.find((item) => item.group === "Admin")?.titles ?? []
const EXEC_TITLES = TITLES.find((item) => item.group === "Executive Management")?.titles ?? []
const IT_TITLES = TITLES.find((item) => item.group === "IT")?.titles ?? []

const frontEndUrl =
    process.env.NODE_ENV === "dev"
        ? "http://localhost:3000/"
        : process.env.NODE_ENV === "test"
        ? "https://test-kepler.nova-compression.com/"
        : "https://kepler.nova-compression.com/"

export async function sendPrEmail(emailParams: PrEmailParams, newPR: boolean) {
    const { partsReq } = emailParams
    let emailTag: string = ""

    // Determine recipient(s)
    const { recipients, cc } = await determineRecipients(partsReq, newPR)

    // Determine email tag
    if (newPR) {
        if (process.env.NODE_ENV === "dev") {
            emailTag = "DEV New PR"
        } else if (process.env.NODE_ENV === "test") {
            emailTag = "TEST New PR"
        } else if (process.env.NODE_ENV === "production") {
            emailTag = "PROD New Pr"
        }
    } else {
        if (process.env.NODE_ENV === "dev") {
            emailTag = "DEV Updated PR"
        } else if (process.env.NODE_ENV === "test") {
            emailTag = "TEST Updated PR"
        } else if (process.env.NODE_ENV === "production") {
            emailTag = "PROD Updated Pr"
        }
    }

    if (recipients.length > 0) {
        // Generate email subject line
        const subject = `KEPLER: Parts Requisition #${partsReq.id} - ${partsReq.urgency} - ${partsReq.region} ${
            partsReq.unit ? "- " + partsReq.unit.engineFamily : ""
        } ${partsReq.unit ? "- " + partsReq.unit.unitNumber : partsReq.truck ? "- " + partsReq.truck : ""} - $${calcCost(partsReq.parts).toFixed(2)}`

        // Generate HTML email body
        const htmlBody = `
            <h4>KEPLER PR #${partsReq.id} requires your attention:</h4>
            <p>
                Order Type: ${partsReq.orderType}
            </p>
            ${partsReq.unit ? "<p>Customer: " + partsReq.unit.customer + "</p>" : ""}
            ${partsReq.unit ? "<p>Location: " + partsReq.unit.location + "</p>" : ""}
            <p>
                Status: ${partsReq.status}
            </p>
            <p>
                Requester: ${partsReq.requester.firstName} ${partsReq.requester.lastName}
            </p>
            <p>
                Order Date: ${partsReq.date.toLocaleString("en-US", { timeZone: "America/Chicago" })}
            </p>
            ${!newPR ? "<p>Updated: " + partsReq.updated.toLocaleString("en-US", { timeZone: "America/Chicago" }) + "</p>" : ""}
            <br/>
            <a href="${frontEndUrl}supply-chain/${partsReq.id}">Click here to go to PR #${partsReq.id}</a>
        `

        // Send email
        postmarkClient.sendEmail({
            From: "kepler@nova-compression.com",
            To: recipients.toString(),
            Cc: cc.toString(),
            Subject: subject,
            HtmlBody: htmlBody,
            MessageStream: "outbound",
            TrackOpens: true,
            Tag: emailTag,
        })
    }
}

async function determineRecipients(partsReq: PartsReq, newPR: boolean) {
    let recipients: Array<string> = []
    let cc: Array<string> = []
    const prCost = calcCost(partsReq.parts)

    // Determine recipients on a new PR submission
    if (newPR) {
        if (partsReq.status === "Pending Approval") {
            // Determine manager/director/VP based on PR cost
            if (FIELD_SHOP_SERVICE_TITLES.includes(partsReq.requester.jobTitle)) {
                // Field/Shop Service
                if (prCost < 5000) {
                    // Manager
                    const manager = await getEmployeesManager(partsReq.requester.supervisorId)
                    recipients.push(manager.email)
                } else if (prCost >= 5000 && prCost < 10000) {
                    // Director
                    const director = await getEmployeesDirector(partsReq.requester.managerId)
                    recipients.push(director.email)
                } else if (prCost >= 10000) {
                    // VP/SVP
                    if (["Carlsbad", "Pecos", "North Permian", "South Permian"].includes(partsReq.region)) {
                        recipients.push("sstewart@nova-compression.com")
                    } else {
                        recipients.push("tyount@nova-compression.com")
                    }
                }
            } else if (
                OPS_SHOP_MANAGER_TITLES.includes(partsReq.requester.jobTitle) ||
                EMISSIONS_MANAGER_TITLES.includes(partsReq.requester.jobTitle)
            ) {
                if (prCost < 5000) {
                    // Manager
                } else if (prCost >= 5000 && prCost < 10000) {
                    // Director
                    const director = await getEmployeesDirector(partsReq.requester.managerId)
                    recipients.push(director.email)
                } else if (prCost >= 10000) {
                    // VP/SVP
                    if (["Carlsbad", "Pecos", "North Permian", "South Permian"].includes(partsReq.region)) {
                        recipients.push("sstewart@nova-compression.com")
                    } else {
                        recipients.push("tyount@nova-compression.com")
                    }
                }
            } else if (OPS_SHOP_DIRECTOR_TITLES.includes(partsReq.requester.jobTitle)) {
                if (prCost < 5000) {
                    // Manager
                } else if (prCost >= 5000 && prCost < 10000) {
                    // Director
                } else if (prCost >= 10000) {
                    // VP/SVP
                    if (["Carlsbad", "Pecos", "North Permian", "South Permian"].includes(partsReq.region)) {
                        recipients.push("sstewart@nova-compression.com")
                    } else {
                        recipients.push("tyount@nova-compression.com")
                    }
                }
            }
        } else if (partsReq.status === "Pending Quote" || partsReq.status === "Approved") {
            // Get supply chain employees based on PR region
            const scEmployees = await getRegionalSupplyChain(partsReq.region)
            recipients = recipients.concat(scEmployees.map((employee) => employee.email))
        }
    } else {
        // Determine recipients on updated PR
        if (partsReq.status === "Pending Approval") {
            // Ops manager/director/VP
            if (prCost < 5000) {
                // Manager
                const manager = await getEmployeesManager(partsReq.requester.supervisorId)
                recipients.push(manager.email)
            } else if (prCost >= 5000 && prCost < 10000) {
                // Director
                const director = await getEmployeesDirector(partsReq.requester.managerId)
                recipients.push(director.email)
            } else if (prCost >= 10000) {
                // VP/SVP
                if (["Carlsbad", "Pecos", "North Permian", "South Permian"].includes(partsReq.region)) {
                    recipients.push("sstewart@nova-compression.com")
                } else {
                    recipients.push("tyount@nova-compression.com")
                }
            }
        } else if (partsReq.status === "Pending Quote") {
            // Regional supply chain + ops manager/director/vp
            const scEmployees = await getRegionalSupplyChain(partsReq.region)
            recipients = recipients.concat(scEmployees.map((employee) => employee.email))

            if (prCost < 5000) {
                // Manager
                const manager = await getEmployeesManager(partsReq.requester.supervisorId)
                cc.push(manager.email)
            } else if (prCost >= 5000 && prCost < 10000) {
                // Director
                const director = await getEmployeesDirector(partsReq.requester.managerId)
                cc.push(director.email)
            } else if (prCost >= 10000) {
                // VP/SVP
                if (["Carlsbad", "Pecos", "North Permian", "South Permian"].includes(partsReq.region)) {
                    cc.push("sstewart@nova-compression.com")
                } else {
                    cc.push("tyount@nova-compression.com")
                }
            }
        } else if (partsReq.status === "Quote Provided - Pending Approval") {
            // Ops manager/director/VP
            if (prCost < 5000) {
                // Manager
                const manager = await getEmployeesManager(partsReq.requester.supervisorId)
                recipients.push(manager.email)
            } else if (prCost >= 5000 && prCost < 10000) {
                // Director
                const director = await getEmployeesDirector(partsReq.requester.managerId)
                recipients.push(director.email)
            } else if (prCost >= 10000) {
                // VP/SVP
                if (["Carlsbad", "Pecos", "North Permian", "South Permian"].includes(partsReq.region)) {
                    recipients.push("sstewart@nova-compression.com")
                } else {
                    recipients.push("tyount@nova-compression.com")
                }
            }
        } else if (partsReq.status === "Rejected - Adjustments Required") {
            // Requester
            recipients.push(partsReq.requester.email)
        } else if (partsReq.status === "Approved - On Hold") {
            // None
        } else if (partsReq.status === "Approved") {
            // Regional supply chain
            const scEmployees = await getRegionalSupplyChain(partsReq.region)
            recipients = recipients.concat(scEmployees.map((employee) => employee.email))
        } else if (partsReq.status === "Sourcing - In Progress") {
            // None
        } else if (partsReq.status === "Sourcing - Information Required") {
            // Requester + ops manager/director/vp
            recipients.push(partsReq.requester.email)

            if (prCost < 5000) {
                // Manager
                const manager = await getEmployeesManager(partsReq.requester.supervisorId)
                cc.push(manager.email)
            } else if (prCost >= 5000 && prCost < 10000) {
                // Director
                const director = await getEmployeesDirector(partsReq.requester.managerId)
                cc.push(director.email)
            } else if (prCost >= 10000) {
                // VP/SVP
                if (["Carlsbad", "Pecos", "North Permian", "South Permian"].includes(partsReq.region)) {
                    cc.push("sstewart@nova-compression.com")
                } else {
                    cc.push("tyount@nova-compression.com")
                }
            }
        } else if (partsReq.status === "Sourcing - Information Provided") {
            // Supply chain contact
            recipients.push(partsReq.contact!.email)
        } else if (partsReq.status === "Sourcing - Pending Amex Approval") {
            // Supply chain management
            const scManagement = await getSupplyChainManagement()
            recipients = recipients.concat(scManagement.map((employee) => employee.email))
        } else if (partsReq.status === "Sourcing - Amex Approved") {
            // Regional supply chain + supply chain management (that didn't approve)
            const scEmployees = await getRegionalSupplyChain(partsReq.region)
            recipients = recipients.concat(scEmployees.map((employee) => employee.email))

            const scManagement = await getSupplyChainManagement()
            const approverComment = (await getPartsReqComments(partsReq.id)).find((comment) =>
                comment.comment.includes("-> Sourcing - Amex Approved")
            )
            if (approverComment) {
                const scManagementFiltered = scManagement.filter((employee) => `${employee.firstName} ${employee.lastName}` !== approverComment.name)
                cc.concat(scManagementFiltered.map((employee) => employee.email))
            }
        } else if (partsReq.status === "Sourcing - Request to Cancel") {
            // Ops manager/director/vp
            if (prCost < 5000) {
                // Manager
                const manager = await getEmployeesManager(partsReq.requester.supervisorId)
                recipients.push(manager.email)
            } else if (prCost >= 5000 && prCost < 10000) {
                // Director
                const director = await getEmployeesDirector(partsReq.requester.managerId)
                recipients.push(director.email)
            } else if (prCost >= 10000) {
                // VP/SVP
                if (["Carlsbad", "Pecos", "North Permian", "South Permian"].includes(partsReq.region)) {
                    recipients.push("sstewart@nova-compression.com")
                } else {
                    recipients.push("tyount@nova-compression.com")
                }
            }
        } else if (partsReq.status === "Ordered - Awaiting Parts") {
            // Requester, ops manager/director/vp, regional supply chain, parts runners
            recipients.push(partsReq.requester.email)

            if (prCost < 5000) {
                // Manager
                const manager = await getEmployeesManager(partsReq.requester.supervisorId)
                cc.push(manager.email)
            } else if (prCost >= 5000 && prCost < 10000) {
                // Director
                const director = await getEmployeesDirector(partsReq.requester.managerId)
                cc.push(director.email)
            } else if (prCost >= 10000) {
                // VP/SVP
                if (["Carlsbad", "Pecos", "North Permian", "South Permian"].includes(partsReq.region)) {
                    cc.push("sstewart@nova-compression.com")
                } else {
                    cc.push("tyount@nova-compression.com")
                }
            }

            const scEmployees = await getRegionalSupplyChain(partsReq.region)
            recipients = recipients.concat(scEmployees.map((employee) => employee.email))

            const partsRunners = await getRegionalPartsRunners(partsReq.region)
            recipients.concat(partsRunners.map((employee) => employee.email))
        } else if (partsReq.status === "Completed - Parts Staged/Delivered") {
            // Requester, manager, parts runners
            recipients.push(partsReq.requester.email)

            const manager = await getEmployeesManager(partsReq.requester.supervisorId)
            recipients.push(manager.email)

            const partsRunners = await getRegionalPartsRunners(partsReq.region)
            recipients.concat(partsRunners.map((employee) => employee.email))
        } else if (partsReq.status === "Closed - Partially Received") {
            // None
        } else if (partsReq.status === "Closed - Parts in Hand") {
            // None
        } else if (partsReq.status === "Rejected - Closed") {
            // Requester
            recipients.push(partsReq.requester.email)
        } else if (partsReq.status === "Closed - Order Canceled") {
            // Requester
            recipients.push(partsReq.requester.email)
        }
    }

    return { recipients, cc }
}
