import { COGNITO_USER_POOL_ID, AWS_REGION } from '../config'
import { assertHasRequiredEnvVars } from '@/common/required-env-vars'
import jwt from 'jsonwebtoken'
import { JwksClient } from 'jwks-rsa'

assertHasRequiredEnvVars(['AWS_REGION', 'COGNITO_USER_POOL_ID'])

const jwks = {
  keys: [
    {
      alg: 'RS256',
      e: 'AQAB',
      kid: 'Vp77r6gAaQsSllwG/Gg2WBHD6JqqqcXpjXJ4D7DTZ68=',
      kty: 'RSA',
      n: 'v6jjckOnFzcfFdv_tScujyufeyirDW8DLGXFaJaWD8ZAwtF-wE_HKr2zdTXfW2uizxpyGbg1CUkRuf7cuymXsUdVcD6wXhNFXlN7aPezkvOHhXUMgNmrlUIfyXNDupQr2NVi240OWDGs-X3a4Yq81lhDbqEmfOxzDmk8fPRSm_a17LkeQktnFZfJiut4fxMbdGqTzW8T5TYDmzjNROdUsc9lY37E51a2ICRMkNH04kB6cUXRyvRGRXh3Xrlf_dAsDFW36T0Dk6wSxZ_S7oxoA4uXU8f4S-DSwdh3Vi1SZwKnBb73MLLszHA8a6QA1O4GDoX_OT4UfA3muxJbStJTpw',
      use: 'sig',
    },
    {
      alg: 'RS256',
      e: 'AQAB',
      kid: 'DM3TwL4vMe5RaIw0IEzu+nk5AJOdr9soyiJGykU6hvg=',
      kty: 'RSA',
      n: '2e9y2hXP6jCjftP1S4YAE4WqJpfmMgsL0e25mYTTmm0JeyjG2Dw2Km3gA7pjnn3QmGo3L0E3P-sjHiMcDNvSM4Ca0euTYM0DkRGSCPrFg94ly-ArzBT72CxtvIyTJLsZaoxASZgfhXMPLtmX28FNs_C2-wqb-7QrftIscx6L09-ds-hvz4SBdiiFlT_p3t3x9LOD6DJF1HsBK06Bn_Atv3OZEKob-uwBiVQ__MVTYNWK6_7tD9lZmW37iJfJF0Nh7uL7fYYY4m0DZD7NFGscLWFHXBN6GwM3udRTt7xVZ3KiI64f1ljAsYt2STn55NEM09Km3i0k6PIgfhT4ZT5SPw',
      use: 'sig',
    },
  ],
}

const client = new JwksClient({
  jwksUri: `https://cognito-idp.${AWS_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
  getKeysInterceptor: () => Promise.resolve(jwks.keys),
})

const verify = async (token: string): Promise<jwt.JwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) {
          reject(err)
        } else {
          resolve(decoded as jwt.JwtPayload)
        }
      },
    )
  })
}

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey()
    callback(err, signingKey)
  })
}

export const idTokenVerifier = {
  verify,
}
