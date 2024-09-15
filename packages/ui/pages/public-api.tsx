import React, { useState, useEffect, useRef } from 'react'
import { Card, Row, Col, Typography, Statistic } from 'antd'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const { Title, Paragraph } = Typography
const INTERVAL = 500

export default function PublicApi() {
  const [stats, setStats] = useState({
    apiEndpoint: { min: Infinity, avg: 0, max: -Infinity, count: 0 },
    lambdaFunction: { min: Infinity, avg: 0, max: -Infinity, count: 0 },
    cloudFront: { min: Infinity, avg: 0, max: -Infinity, count: 0 },
  })

  const [timeSeriesData, setTimeSeriesData] = useState<Array<any>>([])
  const startTimeRef = useRef(Date.now())
  const maxDataPointsRef = useRef(60) // Start with 60 seconds

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now()
      const elapsedSeconds = Math.floor((currentTime - startTimeRef.current) / 1000)

      const endpoints = [
        { name: 'apiEndpoint', url: `${process.env.NEXT_PUBLIC_ApiEndpoint}/public` },
        { name: 'lambdaFunction', url: `${process.env.NEXT_PUBLIC_LambdaFunctionUrl}public` },
        { name: 'cloudFront', url: `${process.env.NEXT_PUBLIC_CloudFrontDistributionUrl}/public` },
      ]

      const newDataPoint = { timestamp: elapsedSeconds }

      endpoints.forEach(({ name, url }) => {
        const startTime = performance.now()
        fetch(url)
          .then(() => {
            const endTime = performance.now()
            const duration = endTime - startTime

            setStats((prevStats) => {
              const endpoint = prevStats[name]
              const newCount = endpoint.count + 1
              const newAvg = (endpoint.avg * endpoint.count + duration) / newCount
              return {
                ...prevStats,
                [name]: {
                  min: Math.min(endpoint.min, duration),
                  avg: newAvg,
                  max: Math.max(endpoint.max, duration),
                  count: newCount,
                },
              }
            })

            newDataPoint[name] = Math.round(duration)
          })
          .catch((error) => console.error(`Error fetching ${name}:`, error))
      })

      setTimeSeriesData((prevData) => {
        const newData = [...prevData, newDataPoint]
        if (newData.length > maxDataPointsRef.current) {
          maxDataPointsRef.current = newData.length
        }
        return newData
      })
    }, INTERVAL)

    return () => clearInterval(interval)
  }, [])

  const StatCard = ({ title, stats }) => (
    <Card title={title} style={{ marginBottom: 16 }}>
      <Statistic title="Min" value={stats.min.toFixed(2)} suffix="ms" />
      <Statistic title="Avg" value={stats.avg.toFixed(2)} suffix="ms" />
      <Statistic title="Max" value={stats.max.toFixed(2)} suffix="ms" />
      <Statistic title="Count" value={stats.count} />
    </Card>
  )

  const formatXAxis = (value) => {
    const minutes = Math.floor(value / 60)
    const seconds = value % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>API Request Statistics</Title>
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <StatCard title="API Endpoint" stats={stats.apiEndpoint} />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard title="Lambda Function" stats={stats.lambdaFunction} />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard title="CloudFront" stats={stats.cloudFront} />
        </Col>
      </Row>
      <Card title="Request Times Over Time" style={{ marginTop: 16 }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" domain={[0, maxDataPointsRef.current]} type="number" tickFormatter={formatXAxis} />
            <YAxis />
            <Tooltip labelFormatter={formatXAxis} />
            <Legend />
            <Line type="monotone" dataKey="apiEndpoint" stroke="#8884d8" name="API Endpoint" dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="lambdaFunction" stroke="#82ca9d" name="Lambda Function" dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="cloudFront" stroke="#ffc658" name="CloudFront" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Paragraph style={{ marginTop: 16 }}>
        Check dev tools network tab. Note that this is deployed to us-west-2, and the latency is only observable in cross-region requests.
      </Paragraph>
    </div>
  )
}
