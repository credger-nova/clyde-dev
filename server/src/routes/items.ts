import { FastifyInstance } from "fastify";
import getNsAccessJwt from "../utils/netsuite/get-ns-access-jwt";
import axios from "axios";

async function routes(fastify: FastifyInstance) {
    fastify.get("/", async (req, res) => {
        const jwt = await getNsAccessJwt()

        const { data } = await axios.get("https://8898907-sb1.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=671&deploy=1",
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt.access_token}`
                }
            })

        return data
    })
}

export default routes