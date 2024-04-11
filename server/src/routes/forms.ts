import { CreatePartsReq, PartsReqQuery, UpdatePartsReq } from "../models/partsReq"

import { FastifyInstance, FastifyRequest } from "fastify"
import { createPartsReq, getPartsReq, getPartsReqs, sumPrWithAfe, updatePartsReq } from "../api/forms"
import { generatePartsReqPDF } from "../api/pdf"

async function routes(fastify: FastifyInstance) {
    // POST request to get Parts Reqs with requirements defined in body
    fastify.post("/parts-req", async (req: FastifyRequest<{ Body: PartsReqQuery }>, res) => {
        const query = req.body

        const partsReqs = await getPartsReqs(query)

        res.status(200).send(partsReqs)
    })

    // Get single Parts Req by id
    fastify.get<{ Params: { id: string } }>("/parts-req/:id", async (req, res) => {
        const { id } = req.params

        const partsReq = await getPartsReq(Number(id))

        if (partsReq) {
            res.status(200).send(partsReq)
        } else {
            res.status(404).send({ error: `No Parts Requisition with id: ${req.params.id} found.` })
        }
    })

    // Create a Parts Req form
    fastify.post("/parts-req/create", async (req: FastifyRequest<{ Body: { partsReq: CreatePartsReq } }>, res) => {
        const { partsReq } = req.body

        const createdPartsReq = await createPartsReq(partsReq)

        res.status(201).send(createdPartsReq)
    })

    // Update a Parts Req form
    fastify.put("/parts-req/:id", async (req: FastifyRequest<{ Params: { id: string }, Body: { user: string, updateReq: Partial<UpdatePartsReq> } }>, res) => {
        const { id } = req.params
        const { user, updateReq } = req.body

        const updatedPartsReq = await updatePartsReq(Number(id), user, updateReq)

        res.status(201).send(updatedPartsReq)
    })

    // Generate a PDF for a Parts Req
    fastify.get<{ Params: { id: string } }>("/parts-req/export/:id", async (req, res) => {
        const { id } = req.params

        const partsReq = await getPartsReq(Number(id))

        if (partsReq) {
            const pdf = await generatePartsReqPDF(partsReq)

            return res.status(200).send(pdf) // TODO: figure out why this only works with return and not res.status().send()
        } else {
            res.status(404).send({ error: `No Parts Requisition with id: ${req.params.id} found.` })
        }
    })

    // Get cost sum of PRs with an associated AFE #
    fastify.get<{ Params: { afeNumber: string } }>("/parts-req/cost/:afeNumber", async (req, res) => {
        const { afeNumber } = req.params

        const cost = await sumPrWithAfe(afeNumber)

        return cost
    })
}

export default routes