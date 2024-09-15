import React, { useState, useEffect } from 'react'
import AuthenticatedPage from '../components/layouts/AuthenticatedPage'
import ApiTests from '../components/ApiTests'
import { fetchAuthSession } from 'aws-amplify/auth'

export default function PrivateApiTest() {
  const [authorizationHeader, setAuthorizationHeader] = useState<null | string | undefined>(null)

  useEffect(() => {
    async function getAuthSession() {
      try {
        const authSession = await fetchAuthSession()
        const idToken = authSession.tokens?.idToken?.toString()
        setAuthorizationHeader(idToken)
      } catch (error) {
        console.error('Error fetching auth session:', error)
      }
    }

    getAuthSession()
  }, [])

  return (
    <AuthenticatedPage>
      {authorizationHeader ?
        <ApiTests endpoint="private" authorizationHeader={authorizationHeader} />
      : <p>Loading...</p>}
    </AuthenticatedPage>
  )
}
