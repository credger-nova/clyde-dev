import { FastifyInstance } from "fastify"
import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const KPA_KEY = process.env.KPA_KEY
const URL = "https://api.kpaehs.com/v1/responses.flat"
const LIMIT = 100

async function getPages(): Promise<number> {
    const postBody = {
        token: KPA_KEY,
        form_id: 217334,
        limit: LIMIT,
        skip_field_id_mapping_json: true
    }

    const { data } = await axios.post(URL, postBody)

    return data.paging.last_page
}

async function routes(fastify: FastifyInstance) {
    // Route to get AFEs from KPA
    fastify.get("/afe", async (req, res) => {
        var afeNums = [];
        const pages = await getPages()

        for (var i = 1; i < pages + 1; i++) {
            const { data } = await axios.post("https://api.kpaehs.com/v1/responses.flat", {
                token: process.env.KPA_KEY,
                form_id: 217334,
                limit: LIMIT,
                skip_field_id_mapping_json: true,
                columns: [
                    "og42wkqwer5ufiwx" // AFE #
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
}

export default routes