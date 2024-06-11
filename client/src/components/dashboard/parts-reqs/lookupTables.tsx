export const STATUS_GROUPS = ["Pending Approval", "Pending Quote", "Rejected", "Approved", "Sourcing", "Parts Ordered", "Parts Staged", "Closed"]

export const SC_GROUPS = ["Pending Quote", "Approved", "Sourcing", "Parts Ordered", "Parts Staged"]

export const ALLOWED_GROUPS = [
    "Field Service",
    "Ops Manager",
    "Ops Director",
    "Ops Vice President",
    "Shop Service",
    "Shop Supervisor",
    "Shop Director",
    "Supply Chain",
    "Supply Chain Management",
    "Admin",
    "Business Development",
    "Executive Management",
    "IT",
]

export const PERSONNEL_GROUPS: { [key: string]: string } = {
    "Field Service": "L1",
    "Shop Service": "L1",
    "Ops Manager": "L2",
    "Shops Supervisoer": "L2",
    "Ops Director": "L3",
    "Shop Director": "L3",
    "Ops Vice Presient": "L4",
    "Supply Chain": "L5",
    "Supply Chain Management": "L6",
    Admin: "L6",
    "Business Development": "L6",
    "Executive Management": "L6",
    IT: "L6",
}

export const STATUS_GROUPS_MAP: { [key: string]: Array<string> } = {
    "Pending Quote": ["Pending Quote"],
    "Pending Approval": ["Pending Approval", "Quote Provided - Pending Approval", "Sourcing - Request to Cancel"],
    Rejected: ["Rejected - Adjustments Required"],
    Approved: ["Approved", "Approved - On Hold"],
    Sourcing: [
        "Sourcing - In Progress",
        "Sourcing - Information Required",
        "Sourcing - Information Provided",
        "Sourcing - Pending Amex Approval",
        "Sourcing - Amex Approved",
        "Sourcing - Request to Cancel",
    ],
    "Parts Ordered": ["Ordered - Awaiting Parts"],
    "Parts Staged": ["Completed - Parts Staged/Delivered"],
    Closed: ["Closed - Partially Received", "Closed - Parts in Hand", "Rejected - Closed", "Closed - Order Canceled"],
    "Unit Down": [
        "Pending Approval",
        "Pending Quote",
        "Quote Provided - Pending Approval",
        "Rejected - Adjustments Required",
        "Approved - On Hold",
        "Approved",
        "Sourcing - In Progress",
        "Sourcing - Information Required",
        "Sourcing - Information Provided",
        "Sourcing - Pending Amex Approval",
        "Sourcing - Amex Approved",
        "Ordered - Awaiting Parts",
    ],
}

export const STATUS_MAP: { [key: string]: string } = {
    "Pending Quote": "Pending Quote",
    "Pending Approval": "Pending Approval",
    "Quote Provided - Pending Approval": "Pending Approval",
    "Sourcing - Request to Cancel": "Pending Approval",
    "Rejected - Adjustments Required": "Rejected",
    Approved: "Approved",
    "Approved - On Hold": "Approved",
    "Sourcing - In Progress": "Sourcing",
    "Sourcing - Information Required": "Sourcing",
    "Sourcing - Information Provided": "Sourcing",
    "Sourcing - Pending Amex Approval": "Sourcing",
    "Sourcing - Amex Approved": "Sourcing",
    "Ordered - Awaiting Parts": "Parts Ordered",
    "Completed - Parts Staged/Delivered": "Parts Staged",
    "Closed - Partially Received": "Closed",
    "Closed - Parts in Hand": "Closed",
    "Rejected - Closed": "Closed",
    "Closed - Order Canceled": "Closed",
}

export const UNIT_DOWN_STATUSES = [
    "Pending Approval",
    "Pending Quote",
    "Quote Provided - Pending Approval",
    "Rejected - Adjustments Required",
    "Approved - On Hold",
    "Approved",
    "Sourcing - In Progress",
    "Sourcing - Information Required",
    "Sourcing - Information Provided",
    "Sourcing - Pending Amex Approval",
    "Sourcing - Amex Approved",
    "Ordered - Awaiting Parts",
]
