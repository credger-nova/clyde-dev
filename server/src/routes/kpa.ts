import { FastifyInstance } from "fastify"
import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const KPA_KEY = process.env.KPA_KEY
const RESPONSES_URL = "https://api.kpaehs.com/v1/responses.flat"
const USERS_URL = "https://api.kpaehs.com/v1/users.list"
const JOB_TITLES_URL = "https://api.kpaehs.com/v1/jobtitles.list"
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

    // Route to get Employees
    fastify.get("/employees", async (req, res) => {
        var employees = []

        const titles = await getJobTitles()

        const postBody = {
            token: KPA_KEY
        }

        const { data } = await axios.post(USERS_URL, postBody)

        for (const user of data.users) {
            employees.push({
                id: user.id,
                firstName: user.firstname,
                lastName: user.lastname,
                email: user.email,
                title: user.jobTitle_id,
                supervisorId: user.supervisor_id,
                managerId: user.managerId
            })
        }

        for (const employee of employees) {
            const res = titles.find(obj => obj.id === employee.title)

            // Remove employees with no title
            if (res) {
                employee.title = res.title
            } else {
                const index = employees.indexOf(employee)
                if (index > -1) {
                    employees.splice(index, 1)
                }
            }
        }

        return employees
    })
}

export default routes