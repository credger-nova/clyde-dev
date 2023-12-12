import signNsJwt from "./sign-ns-jwt"
import axios from "axios"

export default async function getNsAccessJwt() {
    const signedJWT = await signNsJwt()

    const { data } = await axios.post("https://8898907-sb1.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token", {
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