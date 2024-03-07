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

async function getPages(): Promise<number> {
    const postBody = {
        token: KPA_KEY,
        form_id: 217334,
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
    const pages = await getPages()

    for (var i = 1; i < pages + 1; i++) {
        const { data } = await axios.post(RESPONSES_URL, {
            token: process.env.KPA_KEY,
            form_id: 217334,
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

    var employees = []

    for (const user of data.users) {
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

    return employees
}

// Get all employees under a director
export const getDirectorsEmployees = async (id: string) => {
    const postBody = {
        token: KPA_KEY
    }

    const { data } = await axios.post(ALL_USERS_URL, postBody)

    var employees = []

    for (const user of data.users) {
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

    return employees
}