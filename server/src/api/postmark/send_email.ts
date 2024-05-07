import dotenv from "dotenv"

import { PrEmailParams } from "../../models/email"
import { PartsReq } from "../../models/partsReq"
import { TITLES } from "../../utils/titles"

import { calcCost } from "../forms"

import { postmarkClient } from "../../utils/postmark/postmark-client"
import { getAllEmployees, getEmployeesDirector, getEmployeesManager } from "../kpa/employee"

dotenv.config()

const SUPPLY_CHAIN_TITLES = TITLES.find(item => item.group === "Supply Chain")?.titles ?? []
const SC_MANAGEMENT_TITLES = TITLES.find(item => item.group === "Supply Chain Management")?.titles ?? []

const frontEndUrl = process.env.NODE_ENV === "dev" ? "http://localhost:3000/" :
    process.env.NODE_ENV === "test" ? "https://test-kepler.nova-compression.com/" :
        "https://kepler.nova-compression.com/"

export async function sendPrEmail(emailParams: PrEmailParams, newPR: boolean) {
    // Determine recipient(s)
    const recipients = await determineRecipients(emailParams.partsReq, newPR)

    console.log(recipients)

    // Generate HTML email body
    const htmlBody = `
    <h4>PR ${emailParams.partsReq.id} requires your attention:</h4>
    <a href="${frontEndUrl}supply-chain/${emailParams.partsReq.id}">Click here to go to PR ${emailParams.partsReq.id}</a>
    <br/>
    <p>
        Status - ${emailParams.partsReq.status}
    </p>
    <p>
        Requester - ${emailParams.partsReq.requester.firstName} ${emailParams.partsReq.requester.lastName}
    </p>
    <p>
        ${newPR ? "Submitted" : "Updated"} - ${emailParams.partsReq.updated.toLocaleString()}
    </p>
    `

    // Send email
    postmarkClient.sendEmail({
        "From": "kepler@nova-compression.com",
        "To": /*recipients.toString()*/"cdennis@nova-compression.com",
        "Subject": `Parts Requisition ${emailParams.partsReq.id}`,
        "HtmlBody": htmlBody,
        "MessageStream": "outbound",
        "TrackOpens": true,
        "Tag": newPR ? "New PR" : "Updated PR"
    })
}

async function determineRecipients(partsReq: PartsReq, newPR: boolean) {
    let recipients: Array<string> = []
    // Determine recipients on a new PR submission
    if (newPR) {
        if (partsReq.status === "Pending Approval") { // Determine manager/director/VP based on PR cost
            const prCost = calcCost(partsReq.parts)
            if (prCost < 5000) { // Manager
                const manager = await getEmployeesManager(partsReq.requester.supervisorId)
                recipients.push(manager.email)
            } else if (prCost >= 5000 && prCost < 10000) { // Director
                const director = await getEmployeesDirector(partsReq.requester.managerId)
                recipients.push(director.email)
            } else if (prCost > 10000) { // VP/SVP
                if (["Carlsbad", "Pecos", "North Permian", "South Permian"].includes(partsReq.region)) {
                    recipients.push("sstewart@nova-compression.com")
                } else {
                    recipients.push("tyount@nova-compression.com")
                }
            }
        } else if (partsReq.status === "Pending Quote" || partsReq.status === "Approved") {
            // Get supply chain employees based on PR region
            const allEmployees = await getAllEmployees()
            let filteredEmployees = allEmployees.filter((employee) =>
                employee.region.includes(partsReq.region) &&
                (SUPPLY_CHAIN_TITLES.concat(SC_MANAGEMENT_TITLES)).includes(employee.jobTitle)
            )
            recipients = recipients.concat(filteredEmployees.map((employee) => employee.email))
        }
    } else { // Determine recipients on updated PR

    }

    return recipients
}