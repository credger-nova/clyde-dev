import { FastifyInstance, FastifyRequest } from "fastify"
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

async function routes(fastify: FastifyInstance) {
    // Route to get AFEs from KPA
    fastify.get("/afe", async (req, res) => {
        var afeNums = [];
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
    })

    // Route to get all Employees or single Employee by id/email
    fastify.get("/employee", async (req: FastifyRequest<{
        Querystring: {
            id?: string,
            email?: string
        }
    }>, res) => {
        const { id, email } = req.query

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

                const regionRes = regions.filter(obj => user.region.includes(obj.id))

                const regionNames = []
                for (const region of regionRes) {
                    regionNames.push(region.name)
                }

                user.region = regionNames
            }

            if (email) { // Get single Employee by email
                const user = users.find(obj => obj.email === email)

                return user
            } else { // Get all Employees
                return users
            }
        }
    })
}

export default routes