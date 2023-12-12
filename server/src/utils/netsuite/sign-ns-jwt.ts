import CryptoJS from "crypto-js";
import { KJUR } from "jsrsasign";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

export default async function signNsJwt() {
  var jwtHeader = {
    alg: "PS256",
    typ: "JWT",
    kid: "B43hqskLAQ8AQc_eujezT5j-eacfyCQqVNy03DXLT18", // Certificate ID on the client credentials mapping
  };

  let stringifiedJwtHeader = JSON.stringify(jwtHeader);

  var jwtPayload = {
    iss: process.env.CONSUMER_KEY,
    scope: ["restlets", "rest_webservices"],
    iat: Date.now() / 1000,
    exp: Date.now() / 1000 + 3600,
    aud: process.env.AUDIENCE,
  };

  let stringifiedJwtPayload = JSON.stringify(jwtPayload);

  let secret = process.env.CERTIFICATE_PRIVATE_KEY;
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
