import getNsAccessJwt from "../utils/netsuite/get-ns-access-jwt"
import axios from "axios"
import dotenv from "dotenv"
import { Part, NetsuitePart } from "../models/part"

dotenv.config()

// Get all active items from NetSuite
export const getAllItems = async () => {
    const jwt = await getNsAccessJwt()

    const { data } = await axios.get<Array<NetsuitePart>>(`${process.env.NS_RESTLET_BASE}script=${process.env.NS_ITEMS_RESTLET}&deploy=1`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt.access_token}`
            }
        })

    const parts = data.map(part => {
        return {
            id: part.id,
            itemNumber: part.values.itemid,
            description: part.values.salesdescription,
            cost: part.values.averagecost ? Number(part.values.averagecost).toFixed(2) : "",
            mode: part.values.custitem_order_mode.length > 0 ? part.values.custitem_order_mode[0].text : "",
            type: part.recordType
        } as Part
    })

    return parts
}

// Get all trucks from NetSuite
export const getAllTrucks = async () => {
    const jwt = await getNsAccessJwt()

    const { data } = await axios.get<Array<string>>(`${process.env.NS_RESTLET_BASE}script=${process.env.NS_TRUCKS_RESTLET}&deploy=1`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt.access_token}`
            }
        })

    return data
}

// Get all sales orders from NetSuite
export const getAllSalesOrders = async () => {
    const jwt = await getNsAccessJwt()

    const { data } = await axios.get<Array<string>>(`${process.env.NS_RESTLET_BASE}script=${process.env.NS_SO_RESTLET}&deploy=1`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt.access_token}`
            }
        })

    return data
}

// Get all locations from NetSuite
export const getAllLocations = async () => {
    const jwt = await getNsAccessJwt()

    const { data } = await axios.get<Array<string>>(`${process.env.NS_RESTLET_BASE}script=${process.env.NS_LOCATIONS_RESTLET}&deploy=1`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt.access_token}`
            }
        })

    return data
}

// Get all vendors from NetSuite
export const getAllVendors = async () => {
    const jwt = await getNsAccessJwt()

    const { data } = await axios.get<Array<string>>(`${process.env.NS_RESTLET_BASE}script=${process.env.NS_VENDORS_RESTLET}&deploy=1`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt.access_token}`
            }
        })

    return data
}