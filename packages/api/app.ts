import express, { json } from 'express'
import cors from 'cors'
import { getCurrentInvoke } from '@codegenie/serverless-express'
import { StatusCodes } from 'http-status-codes'
import asyncify from 'express-asyncify'
import { ZodError } from 'zod'
import ingredientRouter from './routes/ingredient'
import recipeRouter from './routes/recipe'
import recipeIngredientRouter from './routes/recipe-ingredient'
import recipeRatingRouter from './routes/recipe-rating'
import shoppingListRouter from './routes/shopping-list'
import shoppingListItemRouter from './routes/shopping-list-item'
import stepRouter from './routes/step'
import tagRouter from './routes/tag'
import userRouter from './routes/user'
import meRouter from './routes/me'
import { IS_PRODUCTION } from './config'
import { idTokenVerifier } from './utils/cognito'
import { ClientException } from '@/common/exceptions/ClientException'
import { RecordNotFoundException } from './exceptions/RecordNotFoundException'
import { UnauthenticatedException } from './exceptions/UnauthenticatedException'
import { UnauthorizedException } from './exceptions/UnauthorizedException'

const app = asyncify(express())
app.use(
  cors({
    maxAge: 86400,
  }),
)
app.use(
  json({
    limit: '10mb',
  }),
)
app.get('/public', async (req, res) => {
  res.json({})
})
app.use(async (req, res, next) => {
  const { event = {} } = getCurrentInvoke()

  // NOTE: APIGW sets event.requestContext.authorizer when using an Authorizer. If one isn't set,
  // then we're likely running locally. Validate the token manually.
  let jwtClaims = event.requestContext?.authorizer?.claims
  if (!jwtClaims) {
    if (!req.headers.authorization) {
      throw new UnauthenticatedException({ message: 'Missing Authorization header.' })
    }
    try {
      const token = req.headers.authorization.replace('Bearer ', '')
      jwtClaims = await idTokenVerifier.verify(token)
    } catch (error) {
      throw new UnauthenticatedException({ message: 'Unable to verify token.' })
    }
  }

  if (!jwtClaims || !jwtClaims.email || !jwtClaims.userId) {
    throw new UnauthenticatedException({ message: 'Missing claims.' })
  }

  const { userId, email, role } = jwtClaims
  const groups = jwtClaims['cognito:groups']
  req.cognitoUser = {
    userId,
    email,
    groups,
    role,
  }
  next()

  // NOTE: An alternative to using pre-token-generation and adding orgId to claimsToAddOrOverride
  // is to instead query for the current user here and grab the orgId. The problem with the pre-token-generation
  // approach is that after a user accepts an org invite, the token still reflects the previous orgId.
  // This is currently addressed by forcing a client-side logout upon accepting an invitation, but has issues such as:
  // 1: User must sign back in; 2: Other devices the user is signed in on will be stale until the user sign out and back in, or the token expires.
  // However, the downside of this alternative approach is it adds an additional query for EVERY API call.
  // const currentUser = await getCurrentUser(req)
})

app.use(meRouter)
app.use(ingredientRouter)
app.use(recipeRouter)
app.use(recipeIngredientRouter)
app.use(recipeRatingRouter)
app.use(shoppingListRouter)
app.use(shoppingListItemRouter)
app.use(stepRouter)
app.use(tagRouter)
app.use(userRouter)

app.use((req, res, next) => {
  const error: Error & { statusCode? } = new Error('Route not found')
  error.statusCode = 404
  next(error)
})

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  const statusCode = getStatusCodeFromError(error)
  console.error({
    logName: 'api.errorResponse',
    method: req.method,
    url: req.originalUrl,
    errorMessage: error.message,
    errorFault: error.fault,
    statusCode,
    errorStack: error.stack,
  })
  const response: { message?: string; stack?: any } = {}

  // Return error message and stack trace for non-prod environments
  if (!IS_PRODUCTION) {
    response.stack = error.stack
    response.message = error.message
    // Only return error message for 4xx/client faults in prod environments; Alternative: statusCode >= 400 && statusCode <= 499
  } else if (error.fault === 'client') {
    response.message = error.message
  }

  res.status(statusCode).json(response)
})

function getStatusCodeFromError(error: any): number {
  if (typeof error.statusCode === 'number') return error.statusCode
  if (error instanceof UnauthenticatedException) return StatusCodes.UNAUTHORIZED
  if (error instanceof UnauthorizedException) return StatusCodes.FORBIDDEN
  if (error instanceof RecordNotFoundException) return StatusCodes.NOT_FOUND
  if (error instanceof ClientException || error instanceof ZodError) return StatusCodes.BAD_REQUEST

  return StatusCodes.INTERNAL_SERVER_ERROR
}

export default app
