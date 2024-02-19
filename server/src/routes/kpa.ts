import { FastifyInstance, FastifyRequest } from "fastify"
import axios from "axios"
import { NovaUser } from "../models/novaUser"
import { getAfeNumbers, getAllEmployees, getEmployee } from "../api/kpa"

async function routes(fastify: FastifyInstance) {
    // Route to get AFEs from KPA
    fastify.get("/afe", async (req, res) => {
        const afeNums = await getAfeNumbers()

        res.status(200).send(afeNums)
    })

    // Get all Employees
    fastify.get("/employee/all", async (req, res) => {
        const employees = await getAllEmployees()

        res.status(200).send(employees)
    })

    // Route to get single Employee by id/email
    fastify.get("/employee", async (req: FastifyRequest<{
        Querystring: {
            id?: string,
            email?: string
        }
    }>, res) => {
        const { id, email } = req.query

        const user = await getEmployee(id, email)

        if (user) {
            res.status(200).send(user)
        } else {
            res.status(404).send({ error: "User not found." })
        }
    })
}

export default routes