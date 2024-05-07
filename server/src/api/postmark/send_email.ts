import { PrEmailParams } from "../../models/email"
import { PartsReq } from "../../models/partsReq"
import { TITLES } from "../../utils/titles"

import dotenv from "dotenv"
import { calcCost } from "../forms"
import { postmarkClient } from "../../utils/postmark/postmark-client"
import { getEmployeesDirector, getEmployeesManager, getRegionalSupplyChain, getSupplyChainManagement } from "../kpa/employee"

dotenv.config()

const FIELD_SHOP_SERVICE_TITLES = TITLES.filter(item => item.group === "Field Service" || item.group === "Shop Service").map(group => group.titles).flat()
const OPS_SHOP_MANAGER_TITLES = TITLES.filter(item => item.group === "Ops Manager" || item.group === "Shop Supervisor").map(group => group.titles).flat()
const OPS_SHOP_DIRECTOR_TITLES = TITLES.filter(item => item.group === "Ops Director" || item.group === "Shop Director").map(group => group.titles).flat()
const OPS_VP_TITLES = TITLES.find(item => item.group === "Ops Vice President")?.titles ?? []
const EMISSIONS_MANAGER_TITLES = TITLES.find(item => item.group === "Emissions Manager")?.titles ?? []
const SUPPLY_CHAIN_TITLES = TITLES.find(item => item.group === "Supply Chain")?.titles ?? []
const SC_MANAGEMENT_TITLES = TITLES.find(item => item.group === "Supply Chain Management")?.titles ?? []
const ADMIN_TITLES = TITLES.find(item => item.group === "Admin")?.titles ?? []
const EXEC_TITLES = TITLES.find(item => item.group === "Executive Management")?.titles ?? []
const IT_TITLES = TITLES.find(item => item.group === "IT")?.titles ?? []

const frontEndUrl = process.env.NODE_ENV === "dev" ? "http://localhost:3000/" :
    process.env.NODE_ENV === "test" ? "https://test-kepler.nova-compression.com/" :
        "https://kepler.nova-compression.com/"

export async function sendPrEmail(emailParams: PrEmailParams, newPR: boolean) {
    const { partsReq } = emailParams

    // Determine recipient(s)
    const recipients = process.env.NODE_ENV === "production" ? await determineRecipients(partsReq, newPR) : ["cdennis@nova-compression.com"]

    if (process.env.NODE_ENV !== "production") {
        const testRecipients = await determineRecipients(partsReq, newPR)

        console.log(testRecipients)
    }

    if (recipients.length > 0) {
        // Generate email subject line
        const subject = `KEPLER: Parts Requisition #${partsReq.id} - ${partsReq.urgency} - ${partsReq.region} ${partsReq.unit ? "- " + partsReq.unit.engineFamily : ""} ${partsReq.unit ? "- " + partsReq.unit.unitNumber : partsReq.truck ? "- " + partsReq.truck : ""} - $${calcCost(partsReq.parts).toFixed(2)}`

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
                Order Date: ${partsReq.date.toLocaleString()}
            </p>
            ${!newPR ? "<p>Updated: " + partsReq.updated.toLocaleString() + "</p>" : ""}
            <br/>
            <a href="${frontEndUrl}supply-chain/${partsReq.id}">Click here to go to PR #${partsReq.id}</a>
        `

        // Send email
        postmarkClient.sendEmail({
            "From": "kepler@nova-compression.com",
            "To": recipients.toString(),
            "Subject": subject,
            "HtmlBody": htmlBody,
            "MessageStream": "outbound",
            "TrackOpens": true,
            "Tag": newPR ? "New PR" : "Updated PR"
        })
    }
}

async function determineRecipients(partsReq: PartsReq, newPR: boolean) {
    let recipients: Array<string> = []
    const prCost = calcCost(partsReq.parts)

    // Determine recipients on a new PR submission
    if (newPR) {
        if (partsReq.status === "Pending Approval") { // Determine manager/director/VP based on PR cost
            if (FIELD_SHOP_SERVICE_TITLES.includes(partsReq.requester.jobTitle)) { // Field/Shop Service
                if (prCost < 5000) { // Manager
                    const manager = await getEmployeesManager(partsReq.requester.supervisorId)
                    recipients.push(manager.email)
                } else if (prCost >= 5000 && prCost < 10000) { // Director
                    const director = await getEmployeesDirector(partsReq.requester.managerId)
                    recipients.push(director.email)
                } else if (prCost >= 10000) { // VP/SVP
                    if (["Carlsbad", "Pecos", "North Permian", "South Permian"].includes(partsReq.region)) {
                        recipients.push("sstewart@nova-compression.com")
                    } else {
                        recipients.push("tyount@nova-compression.com")
                    }
                }
            } else if (OPS_SHOP_MANAGER_TITLES.includes(partsReq.requester.jobTitle) || EMISSIONS_MANAGER_TITLES.includes(partsReq.requester.jobTitle)) {
                if (prCost < 5000) { // Manager

                } else if (prCost >= 5000 && prCost < 10000) { // Director
                    const director = await getEmployeesDirector(partsReq.requester.managerId)
                    recipients.push(director.email)
                } else if (prCost >= 10000) { // VP/SVP
                    if (["Carlsbad", "Pecos", "North Permian", "South Permian"].includes(partsReq.region)) {
                        recipients.push("sstewart@nova-compression.com")
                    } else {
                        recipients.push("tyount@nova-compression.com")
                    }
                }
            } else if (OPS_SHOP_DIRECTOR_TITLES.includes(partsReq.requester.jobTitle)) {
                if (prCost < 5000) { // Manager

                } else if (prCost >= 5000 && prCost < 10000) { // Director

                } else if (prCost >= 10000) { // VP/SVP
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
    } else { // Determine recipients on updated PR
        if (partsReq.status === "Pending Approval") { // Ops manager/director/VP
            if (prCost < 5000) { // Manager
                const manager = await getEmployeesManager(partsReq.requester.supervisorId)
                recipients.push(manager.email)
            } else if (prCost >= 5000 && prCost < 10000) { // Director
                const director = await getEmployeesDirector(partsReq.requester.managerId)
                recipients.push(director.email)
            } else if (prCost >= 10000) { // VP/SVP
                if (["Carlsbad", "Pecos", "North Permian", "South Permian"].includes(partsReq.region)) {
                    recipients.push("sstewart@nova-compression.com")
                } else {
                    recipients.push("tyount@nova-compression.com")
                }
            }
        } else if (partsReq.status === "Pending Quote") { // Regional supply chain
            const scEmployees = await getRegionalSupplyChain(partsReq.region)
            recipients = recipients.concat(scEmployees.map((employee) => employee.email))
        } else if (partsReq.status === "Quote Provided - Pending Approval") { // Ops manager/director/VP
            if (prCost < 5000) { // Manager
                const manager = await getEmployeesManager(partsReq.requester.supervisorId)
                recipients.push(manager.email)
            } else if (prCost >= 5000 && prCost < 10000) { // Director
                const director = await getEmployeesDirector(partsReq.requester.managerId)
                recipients.push(director.email)
            } else if (prCost >= 10000) { // VP/SVP
                if (["Carlsbad", "Pecos", "North Permian", "South Permian"].includes(partsReq.region)) {
                    recipients.push("sstewart@nova-compression.com")
                } else {
                    recipients.push("tyount@nova-compression.com")
                }
            }
        } else if (partsReq.status === "Rejected - Adjustments Required") { // Requester
            recipients.push(partsReq.requester.email)
        } else if (partsReq.status === "Approved - On Hold") { // None

        } else if (partsReq.status === "Approved") { // Regional supply chain
            const scEmployees = await getRegionalSupplyChain(partsReq.region)
            recipients = recipients.concat(scEmployees.map((employee) => employee.email))
        } else if (partsReq.status === "Sourcing - In Progress") { // None

        } else if (partsReq.status === "Sourcing - Information Required") { // Requester
            recipients.push(partsReq.requester.email)
        } else if (partsReq.status === "Sourcing - Information Provided") { // Supply chain contact
            recipients.push(partsReq.contact!.email)
        } else if (partsReq.status === "Sourcing - Pending Amex Approval") { // Supply chain management
            const scManagement = await getSupplyChainManagement()
            recipients = recipients.concat(scManagement.map((employee) => employee.email))
        } else if (partsReq.status === "Sourcing - Amex Approved") { // Supply chain contact
            recipients.push(partsReq.contact!.email)
        } else if (partsReq.status === "Sourcing - Request to Cancel") { // Ops manager/director/vp
            if (prCost < 5000) { // Manager
                const manager = await getEmployeesManager(partsReq.requester.supervisorId)
                recipients.push(manager.email)
            } else if (prCost >= 5000 && prCost < 10000) { // Director
                const director = await getEmployeesDirector(partsReq.requester.managerId)
                recipients.push(director.email)
            } else if (prCost >= 10000) { // VP/SVP
                if (["Carlsbad", "Pecos", "North Permian", "South Permian"].includes(partsReq.region)) {
                    recipients.push("sstewart@nova-compression.com")
                } else {
                    recipients.push("tyount@nova-compression.com")
                }
            }
        } else if (partsReq.status === "Ordered - Awaiting Parts") { // None

        } else if (partsReq.status === "Completed - Parts Staged/Delivered") { // Requester + manager
            const manager = await getEmployeesManager(partsReq.requester.supervisorId)
            recipients.push(manager.email)
            recipients.push(partsReq.requester.email)
        } else if (partsReq.status === "Closed - Partially Received") { // None

        } else if (partsReq.status === "Closed - Parts in Hand") { // None

        } else if (partsReq.status === "Rejected - Closed") { // Requester
            recipients.push(partsReq.requester.email)
        } else if (partsReq.status === "Closed - Order Canceled") { // Requester
            recipients.push(partsReq.requester.email)
        }
    }

    return recipients
}