import CryptoJS from "crypto-js";
import { KJUR } from "jsrsasign";
import dotenv from "dotenv";

dotenv.config();

const ENV = process.env.NODE_ENV

export default async function signNsJwt() {
  var jwtHeader = {
    alg: "PS256",
    typ: "JWT",
    kid: ENV === "prod" ? process.env.PROD_NS_CERT_ID : process.env.DEV_NS_CERT_ID, // Certificate ID on the client credentials mapping
  };

  let stringifiedJwtHeader = JSON.stringify(jwtHeader);

  var jwtPayload = {
    iss: process.env.DEV_NS_CONSUMER_KEY,
    scope: ["restlets", "rest_webservices"],
    iat: Date.now() / 1000,
    exp: Date.now() / 1000 + 3600,
    aud: ENV === "prod" ? process.env.PROD_NS_AUDIENCE : process.env.DEV_NS_AUDIENCE,
  };

  let stringifiedJwtPayload = JSON.stringify(jwtPayload);

  let secret = ENV === "prod" ? process.env.PROD_NS_CERT_PRIVATE_KEY : process.env.DEV_NS_CERT_PRIVATE_KEY;
  let encodedSecret = CryptoJS.enc.Base64.stringify(
    CryptoJS.enc.Utf8.parse(secret!)
  );

  let signedJWT = KJUR.jws.JWS.sign(
    "PS256",
    stringifiedJwtHeader,
    stringifiedJwtPayload,
    secret
  );

  return signedJWT
}
