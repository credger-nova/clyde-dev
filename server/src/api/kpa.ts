import axios from "axios"
import dotenv from "dotenv"
import { NovaUser } from "../models/novaUser"

dotenv.config()

const KPA_KEY = process.env.KPA_KEY
const RESPONSES_URL = "https://api.kpaehs.com/v1/responses.flat"
const SINGLE_USER_URL = "https://api.kpaehs.com/v1/users.info"
const ALL_USERS_URL = "https://api.kpaehs.com/v1/users.list"
const JOB_TITLES_URL = "https://api.kpaehs.com/v1/jobtitles.list"
const REGIONS_URL = "https://api.kpaehs.com/v1/linesofbusiness.list"
const LIMIT = 100
const AFE_FORM_ID = 217334

async function getPages(formId: number): Promise<number> {
    const postBody = {
        token: KPA_KEY,
        form_id: formId,
        limit: LIMIT,
        skip_field_id_mapping_json: true
    }

    const { data } = await axios.post(RESPONSES_URL, postBody)

    return data.paging.last_page
}

async function getJobTitles(): Promise<Array<{ id: string, title: string }>> {
    var titles = []

    const postBody = {
        token: KPA_KEY
    }

    const { data } = await axios.post(JOB_TITLES_URL, postBody)

    for (const title of data.jobtitles) {
        titles.push({ id: title.id, title: title.title })
    }

    return titles
}

async function getRegions(): Promise<Array<{ id: string, name: string }>> {
    var regions = []

    const postBody = {
        token: KPA_KEY
    }

    const { data } = await axios.post(REGIONS_URL, postBody)

    for (const region of data.linesofbusiness) {
        regions.push({ id: region.id, name: region.name })
    }

    return regions
}

// Get all AFE numbers
export const getAfeNumbers = async () => {
    var afeNums: Array<string> = [];
    const pages = await getPages(AFE_FORM_ID)

    for (var i = 1; i < pages + 1; i++) {
        const { data } = await axios.post(RESPONSES_URL, {
            token: process.env.KPA_KEY,
            form_id: AFE_FORM_ID,
            limit: LIMIT,
            skip_field_id_mapping_json: true,
            columns: [
                "og42wkqwer5ufiwx" // AFE Number
            ],
            page: i
        })

        for (const obj of data.responses) {
            afeNums.push(obj.og42wkqwer5ufiwx)
        }
    }

    afeNums = afeNums.filter(value => /^-?\d+\.?\d*$/.test(value))

    return afeNums
}

// Get total cost of parts for given AFE
export const getAfeCost = async (afeNumber: string) => {
    const afes: Array<{ number: string, cost: string }> = []
    const pages = await getPages(AFE_FORM_ID)

    for (var i = 1; i < pages; i++) {
        const { data } = await axios.post(RESPONSES_URL, {
            token: process.env.KPA_KEY,
            form_id: AFE_FORM_ID,
            limit: LIMIT,
            skip_field_id_mapping_json: true,
            columns: [
                "og42wkqwer5ufiwx", // AFE Number
                "9mkkjj2kphiv0dgl", // Total parts cost
            ],
            page: i
        })

        for (const obj of data.responses) {
            // Reassign keys
            delete Object.assign(obj, { ['number']: obj['og42wkqwer5ufiwx'] })['og42wkqwer5ufiwx']
            delete Object.assign(obj, { ['cost']: obj['9mkkjj2kphiv0dgl'] })['9mkkjj2kphiv0dgl']

            afes.push(obj)
        }
    }

    const afe = afes.find(afe => afe.number === afeNumber)

    if (afe) {
        return Number(afe.cost)
    } else {
        return null
    }
}

// Get all employees
export const getAllEmployees = async () => {
    const titles = await getJobTitles()
    const regions = await getRegions()

    const postBody = {
        token: KPA_KEY
    }

    const { data } = await axios.post(ALL_USERS_URL, postBody)

    var employees = []

    for (const user of data.users) {
        // Only add active employees
        if (!user.terminationDate) {
            employees.push({
                id: user.id,
                firstName: user.firstname,
                lastName: user.lastname,
                email: user.email,
                title: user.jobTitle_id,
                region: user.lineOfBusiness_id,
                supervisorId: user.supervisor_id,
                managerId: user.manager_id
            } as NovaUser)
        }
    }

    for (const user of employees) {
        const res = titles.find(obj => obj.id === user.title)

        // Remove employees with no title
        if (res) {
            user.title = res.title
        } else {
            const index = employees.indexOf(user)
            if (index > -1) {
                employees.splice(index, 1)
            }
        }

        const regionRes = regions.filter(obj => user.region.includes(obj.id))

        const regionNames = []
        for (const region of regionRes) {
            regionNames.push(region.name)
        }

        user.region = regionNames
    }

    employees.sort((a, b) => { return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`) })

    return employees
}

// Get single employee by either id or email
export const getEmployee = async (id?: string, email?: string) => {
    const titles = await getJobTitles()
    const regions = await getRegions()

    if (id) { // Get single Employee by id
        const postBody = {
            token: KPA_KEY,
            id: id
        }

        const { data } = await axios.post(SINGLE_USER_URL, postBody)

        const user = {
            id: data.user.id,
            firstName: data.user.firstname,
            lastName: data.user.lastname,
            email: data.user.email,
            title: data.user.jobTitle_id,
            region: data.user.lineOfBusiness_id,
            supervisorId: data.user.supervisor_id,
            managerId: data.user.manager_id
        } as NovaUser

        const titleRes = titles.find(obj => obj.id === user.title)

        if (titleRes) {
            user.title = titleRes.title
        }

        const regionRes = regions.filter(obj => user.region.includes(obj.id))

        const regionNames = []
        for (const region of regionRes) {
            regionNames.push(region.name)
        }
        user.region = regionNames

        return user
    } else {
        const postBody = {
            token: KPA_KEY
        }

        const { data } = await axios.post(ALL_USERS_URL, postBody)

        var users = []

        for (const user of data.users) {
            // Only add active employees
            if (!user.terminationDate) {
                users.push({
                    id: user.id,
                    firstName: user.firstname,
                    lastName: user.lastname,
                    email: user.email,
                    title: user.jobTitle_id,
                    region: user.lineOfBusiness_id,
                    supervisorId: user.supervisor_id,
                    managerId: user.manager_id
                } as NovaUser)
            }
        }

        for (const user of users) {
            const res = titles.find(obj => obj.id === user.title)

            // Remove employees with no title
            if (res) {
                user.title = res.title
            } else {
                const index = users.indexOf(user)
                if (index > -1) {
                    users.splice(index, 1)
                }
            }

            // Add employee's regions
            const regionRes = regions.filter(obj => user.region.includes(obj.id))

            const regionNames = []
            for (const region of regionRes) {
                regionNames.push(region.name)
            }

            user.region = regionNames
        }

        if (email) { // Get single Employee by email
            const user = users.find(obj => obj.email === email)

            if (user) {
                return user
            } else {
                return null
            }
        } else {
            return null
        }
    }
}

// Get all employees under a manager
export const getManagersEmployees = async (id: string) => {
    const postBody = {
        token: KPA_KEY
    }

    const { data } = await axios.post(ALL_USERS_URL, postBody)
    const titles = await getJobTitles()

    var employees = []

    for (const user of data.users) {
        // Only add active employees
        if (!user.terminationDate) {
            if (id === user.supervisor_id) {
                employees.push({
                    id: user.id,
                    firstName: user.firstname,
                    lastName: user.lastname,
                    email: user.email,
                    title: user.jobTitle_id,
                    region: user.lineOfBusiness_id,
                    supervisorId: user.supervisor_id,
                    managerId: user.manager_id
                } as NovaUser)
            }
        }
    }

    for (const user of employees) {
        const res = titles.find(obj => obj.id === user.title)

        // Remove employees with no title
        if (res) {
            user.title = res.title
        } else {
            const index = employees.indexOf(user)
            if (index > -1) {
                employees.splice(index, 1)
            }
        }
    }

    return employees
}

// Get all employees under a director
export const getDirectorsEmployees = async (id: string) => {
    const postBody = {
        token: KPA_KEY
    }

    const { data } = await axios.post(ALL_USERS_URL, postBody)
    const titles = await getJobTitles()

    var employees = []

    for (const user of data.users) {
        // Only add active employees
        if (!user.terminationDate) {
            if (id === user.manager_id || id === user.supervisor_id) {
                employees.push({
                    id: user.id,
                    firstName: user.firstname,
                    lastName: user.lastname,
                    email: user.email,
                    title: user.jobTitle_id,
                    region: user.lineOfBusiness_id,
                    supervisorId: user.supervisor_id,
                    managerId: user.manager_id
                } as NovaUser)
            }
        }
    }

    for (const user of employees) {
        const res = titles.find(obj => obj.id === user.title)

        // Remove employees with no title
        if (res) {
            user.title = res.title
        } else {
            const index = employees.indexOf(user)
            if (index > -1) {
                employees.splice(index, 1)
            }
        }
    }

    return employees
}