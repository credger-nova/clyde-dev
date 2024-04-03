import { FastifyInstance, FastifyRequest } from "fastify"
import { getAfeAmount, getAfeNumbers, getAllEmployees, getDirectorsEmployees, getEmployee, getManagersEmployees } from "../api/kpa"

async function routes(fastify: FastifyInstance) {
    // Route to get AFEs from KPA
    fastify.get("/afe", async (req, res) => {
        const afeNums = await getAfeNumbers()

        res.status(200).send(afeNums)
    })

    // Route to get cost of an AFE
    fastify.get<{ Params: { afeNumber: string } }>("/afe/cost/:afeNumber", async (req, res) => {
        const { afeNumber } = req.params

        const cost = await getAfeAmount(afeNumber)

        if (cost) {
            res.status(200).send(cost)
        } else {
            res.status(404).send({ error: `No AFE #${afeNumber} found.` })
        }
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

    // Route to get all of a manager's employees
    fastify.get<{ Params: { id: string } }>("/manager/:id/employees", async (req, res) => {
        const { id } = req.params

        const users = await getManagersEmployees(id)

        if (users) {
            res.status(200).send(users)
        } else {
            res.status(404).send({ error: "No employees found." })
        }
    })

    // Route to get all of a director's employees
    fastify.get<{ Params: { id: string } }>("/director/:id/employees", async (req, res) => {
        const { id } = req.params

        const users = await getDirectorsEmployees(id)

        if (users) {
            res.status(200).send(users)
        } else {
            res.status(404).send({ error: "No employees found." })
        }
    })
}

export default routes