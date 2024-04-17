import { PartsReqQuery, CreatePartsReq, UpdatePartsReq } from "../models/partsReq"
import { NovaUser } from "../models/novaUser"

import { FastifyInstance, FastifyRequest } from "fastify"
import { createPartsReq, updatePartsReq, getPartsReqs, getPartsReq, sumPrWithAfe } from "../api/forms"
import { getAfeByNumber } from "../api/kpa/afe"
import { generatePartsReqPDF } from "../api/pdf"

async function routes(fastify: FastifyInstance) {
    // POST request to get Parts Reqs with requirements defined in body
    fastify.post("/parts-req", async (req: FastifyRequest<{ Body: PartsReqQuery }>, res) => {
        const query = req.body

        const partsReqs = await getPartsReqs(query)

        res.status(200).send(partsReqs)
    })

    // Get a single Parts Req by id
    fastify.get("/parts-req/:id", async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        const { id } = req.params

        const partsReq = await getPartsReq(Number(id))

        if (partsReq) {
            res.status(200).send(partsReq)
        } else {
            res.status(404).send({ error: `No Parts Requisition with id: ${id} found.` })
        }
    })

    // Create a Parts Req form
    fastify.post("/parts-req/create", async (req: FastifyRequest<{ Body: { partsReq: CreatePartsReq } }>, res) => {
        const { partsReq } = req.body
        const createdPartsReq = await createPartsReq(partsReq)
        res.status(201).send(createdPartsReq)
    })

    // Update a Parts Req form
    fastify.put("/parts-req/:id", async (req: FastifyRequest<{ Params: { id: string }, Body: { user: NovaUser, updateReq: Partial<UpdatePartsReq> } }>, res) => {
        const { id } = req.params
        const { user, updateReq } = req.body
        const updatedPartsReq = await updatePartsReq(Number(id), user, updateReq)
        res.status(201).send(updatedPartsReq)
    })

    // Get cost sum of PRs with an associated AFE #
    fastify.get("/parts-req/cost/:afeNumber", async (req: FastifyRequest<{ Params: { afeNumber: string } }>, res) => {
        const { afeNumber } = req.params

        const afe = await getAfeByNumber(afeNumber)

        if (afe) {
            const cost = await sumPrWithAfe(afe)

            res.status(200).send(cost)
        } else {
            res.status(404).send({ error: `No cost associated with AFE ${afeNumber}` })
        }
    })

    // Generate a PDF for a Parts Req
    fastify.get("/parts-req/export/:id", async (req: FastifyRequest<{ Params: { id: string }, Querystring: { pricing?: "true" } }>, res) => {
        const { id } = req.params
        const { pricing } = req.query

        const partsReq = await getPartsReq(Number(id))

        if (partsReq) {
            const pdf = await generatePartsReqPDF(partsReq, pricing ? true : false)

            return res.status(200).send(pdf) // TODO: figure out why this only works with return and not res.status().send()
        } else {
            res.status(404).send({ error: `No Parts Requisition with id: ${req.params.id} found.` })
        }
    })
}

export default routes