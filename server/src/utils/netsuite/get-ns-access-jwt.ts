import signNsJwt from "./sign-ns-jwt"
import axios from "axios"
import dotenv from "dotenv";

dotenv.config();

const ENV = process.env.NODE_ENV

export default async function getNsAccessJwt() {
    const signedJWT = await signNsJwt()

    const { data } = await axios.post(`${ENV === "prod" ? process.env.PROD_NS_TOKEN_URL : process.env.DEV_NS_TOKEN_URL}`, {
        grant_type: "client_credentials",
        client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: signedJWT
    }, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })

    return data
}