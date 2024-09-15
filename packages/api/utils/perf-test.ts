import { idTokenVerifier } from './cognito'
import { idTokenVerifier as awsJwtVerifyIdTokenVerifier } from './cognito-jsonwebtoken'

const authorization = ''

// Helper function to calculate performance statistics
function calculateStats(times) {
  const min = Math.min(...times)
  const max = Math.max(...times)
  const avg = times.reduce((sum, time) => sum + time, 0) / times.length
  const sorted = times.slice().sort((a, b) => a - b)
  const p90 = sorted[Math.floor(sorted.length * 0.9)]

  // Calculate trimmed mean (10% trimmed)
  const trimPercent = 0.1
  const trimStart = Math.floor(sorted.length * trimPercent)
  const trimEnd = Math.ceil(sorted.length * (1 - trimPercent))
  const trimmedValues = sorted.slice(trimStart, trimEnd)
  const trimmedMean = trimmedValues.reduce((sum, time) => sum + time, 0) / trimmedValues.length

  return { min, max, avg, p90, trimmedMean }
}

// Performance test for a single function
async function perfTest(fn, iterations = 100) {
  const times: Array<number> = []

  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    await fn()
    const end = performance.now()
    times.push(end - start)
  }

  return calculateStats(times)
}

// Wrapping the idTokenVerifier.verify call
async function runIdTokenVerifierTest() {
  return await perfTest(() => idTokenVerifier.verify(authorization))
}

// Wrapping the awsJwtVerifyIdTokenVerifier.verify call
async function runAwsJwtVerifyTest() {
  return await perfTest(() => awsJwtVerifyIdTokenVerifier.verify(authorization))
}

// Running both tests and logging the results
;(async () => {
  const idTokenVerifierStats = await runIdTokenVerifierTest()
  console.log('idTokenVerifier stats:', idTokenVerifierStats)

  const awsJwtVerifyStats = await runAwsJwtVerifyTest()
  console.log('awsJwtVerifyIdTokenVerifier stats:', awsJwtVerifyStats)
})()
