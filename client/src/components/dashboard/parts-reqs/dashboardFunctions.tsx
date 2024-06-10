import { NavigateFunction } from "react-router-dom";
import { NovaUser } from "../../../types/kpa/novaUser"
import { STATUS_GROUPS_MAP, STATUS_MAP, UNIT_DOWN_STATUSES } from "./lookupTables";
import { PartsReq } from "../../../types/partsReq"
import { calcCost, opsVpApprovalRequired } from "../../../utils/helperFunctions";

export function navigateToSupplyChain(navigate: NavigateFunction, statusGroup?: string, requesters?: Array<NovaUser>, region?: string, urgency?: string) {
    const statuses = statusGroup ? STATUS_GROUPS_MAP[statusGroup]: []

    navigate("/supply-chain", {
        state: { statuses: statuses, requesters: requesters, region: region, urgency: urgency }
    })

}

export function calcStatusV2(
    partsReqs: Array<PartsReq>,
    statusGroup: string,
    requester?: NovaUser,
    requesterGroup?: Array<NovaUser>,
    region?: string,
    opsVP?: boolean
){
    let count = 0
    for(const partsReq of partsReqs){
        if(
            (STATUS_MAP[partsReq.status] === statusGroup) &&
            (requester ? partsReq.requester.id === requester.id: true) &&
            (requesterGroup ? requesterGroup.map((user) => user.id).includes(partsReq.requester.id): true) &&
            (region ? partsReq.region === region: true) &&
            (opsVP ? calcCost(partsReq.parts) > 10000 || opsVpApprovalRequired(partsReq.unit ?? null, partsReq.parts): true)
        ){count++} 
    }

    return count
}

export function calcUnitDown(partsReqs: Array<PartsReq>, region: string) {
    const filtered = partsReqs.filter(
        (partsReq) => partsReq.region === region && partsReq.urgency === "Unit Down" && UNIT_DOWN_STATUSES.includes(partsReq.status)
    )

    return filtered.length
}

//calcStatus() is deprecated; Use calcStatusV2() instead
export function calcStatus(
    partsReqs: Array<PartsReq>,
    statusGroup: string,
    requester?: NovaUser,
    requesterGroup?: Array<NovaUser>,
    region?: string,
    opsVP?: boolean
) {
    let filtered: Array<PartsReq> = []

    if (statusGroup === "Pending Quote") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Pending Quote")
    } else if (statusGroup === "Pending Approval") {
        filtered = partsReqs.filter(
            (partsReq) =>
                partsReq.status === "Pending Approval" ||
                partsReq.status === "Quote Provided - Pending Approval" ||
                partsReq.status === "Sourcing - Request to Cancel"
        )
    } else if (statusGroup === "Rejected") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Rejected - Adjustments Required")
    } else if (statusGroup === "Approved") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Approved" || partsReq.status === "Approved - On Hold")
    } else if (statusGroup === "Sourcing") {
        filtered = partsReqs.filter(
            (partsReq) =>
                partsReq.status === "Sourcing - In Progress" ||
                partsReq.status === "Sourcing - Information Required" ||
                partsReq.status === "Sourcing - Information Provided" ||
                partsReq.status === "Sourcing - Pending Amex Approval" ||
                partsReq.status === "Sourcing - Amex Approved"
        )
    } else if (statusGroup === "Parts Ordered") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Ordered - Awaiting Parts")
    } else if (statusGroup === "Parts Staged") {
        filtered = partsReqs.filter((partsReq) => partsReq.status === "Completed - Parts Staged/Delivered")
    } else if (statusGroup === "Closed") {
        filtered = partsReqs.filter(
            (partsReq) =>
                partsReq.status === "Closed - Partially Received" ||
                partsReq.status === "Closed - Parts in Hand" ||
                partsReq.status === "Rejected - Closed" ||
                partsReq.status === "Closed - Order Canceled"
        )
    }

    if (requester) {
        filtered = filtered.filter((partsReq) => partsReq.requester.id === requester.id)
    }
    if (requesterGroup) {
        filtered = filtered.filter((partsReq) => requesterGroup.map((user) => user.id).includes(partsReq.requester.id))
    }
    if (region) {
        filtered = filtered.filter((partsReqs) => partsReqs.region === region)
    }
    if (opsVP) {
        filtered = filtered.filter((partsReq) => calcCost(partsReq.parts) > 10000 || opsVpApprovalRequired(partsReq.unit ?? null, partsReq.parts))
    }

    return filtered.length
}

//handleClick() is deprecated; Use navigateToSupplyChain() instead
export const handleClick = (navigate: NavigateFunction, statusGroup: string, requesters?: Array<NovaUser>, region?: string, urgency?: string) => {
    let statuses: Array<string> = []
    if (statusGroup === "Pending Quote") {
        statuses = ["Pending Quote"]
    } else if (statusGroup === "Pending Approval") {
        statuses = ["Pending Approval", "Quote Provided - Pending Approval", "Sourcing - Request to Cancel"]
    } else if (statusGroup === "Rejected") {
        statuses = ["Rejected - Adjustments Required"]
    } else if (statusGroup === "Approved") {
        statuses = ["Approved", "Approved - On Hold"]
    } else if (statusGroup === "Sourcing") {
        statuses = [
            "Sourcing - In Progress",
            "Sourcing - Information Required",
            "Sourcing - Information Provided",
            "Sourcing - Pending Amex Approval",
            "Sourcing - Amex Approved",
            "Sourcing - Request to Cancel",
        ]
    } else if (statusGroup === "Parts Ordered") {
        statuses = ["Ordered - Awaiting Parts"]
    } else if (statusGroup === "Parts Staged") {
        statuses = ["Completed - Parts Staged/Delivered"]
    } else if (statusGroup === "Closed") {
        statuses = ["Closed - Partially Received", "Closed - Parts in Hand", "Rejected - Closed", "Closed - Order Canceled"]        
    } else if (statusGroup === "Unit Down") {
        statuses = UNIT_DOWN_STATUSES
    }

    navigate("/supply-chain", {
        state: { statuses: statuses, requesters: requesters, region: region, urgency: urgency },
    })
}