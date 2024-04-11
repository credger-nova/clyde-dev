import { FastifyInstance, FastifyRequest } from "fastify"
import { getAllEmployees, getDirectorsEmployees, getEmployee, getManagersEmployees } from "../api/kpa/employee"
import { getAllAfe } from "../api/kpa/afe"

async function routes(fastify: FastifyInstance) {
    // Route to get all employees
    fastify.get("/employee/all", async (req: FastifyRequest<{ Querystring: { active?: "true" | "false" } }>, res) => {
        const { active } = req.query

        const employees = await getAllEmployees(active)

        res.status(200).send(employees)
    })

    // Route to get employee by email
    fastify.get("/employee/:email", async (req: FastifyRequest<{ Params: { email: string } }>, res) => {
        const { email } = req.params

        const employee = await getEmployee(email)

        if (employee) {
            res.status(200).send(employee)
        } else {
            res.status(404).send({ error: `Employee with email: ${email} not found` })
        }
    })

    // Route to get all employees under a manager
    fastify.get("/manager/:id/employees", async (req: FastifyRequest<{ Params: { id: string }, Querystring: { active: "true" | "false" } }>, res) => {
        const { id } = req.params
        const { active } = req.query

        const employees = await getManagersEmployees(id, active)

        res.status(200).send(employees)
    })

    // Route to get all employees under a director
    fastify.get("/director/:id/employees", async (req: FastifyRequest<{ Params: { id: string }, Querystring: { active: "true" | "false" } }>, res) => {
        const { id } = req.params
        const { active } = req.query

        const employees = await getDirectorsEmployees(id, active)

        res.status(200).send(employees)
    })

    // Route to get all AFEs
    fastify.get("/afe", async (req, res) => {
        const afes = await getAllAfe()

        res.status(200).send(afes)
    })
}

export default routes