export interface CognitoUser {
  userId: string
  email: string
  groups: any
  role: 'Admin' | 'User'
}

// Fixes TS error: error TS2339: Property 'cognitoUser' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>
declare global {
  namespace Express {
    interface Request {
      cognitoUser: CognitoUser
    }
  }
}
