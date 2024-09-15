import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Typography, Statistic } from 'antd'

const { Title, Paragraph } = Typography

export default function PublicApi() {
  const [stats, setStats] = useState({
    apiEndpoint: { min: Infinity, avg: 0, max: -Infinity, count: 0 },
    lambdaFunction: { min: Infinity, avg: 0, max: -Infinity, count: 0 },
    cloudFront: { min: Infinity, avg: 0, max: -Infinity, count: 0 },
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const endpoints = [
        { name: 'apiEndpoint', url: `${process.env.NEXT_PUBLIC_ApiEndpoint}/public` },
        { name: 'lambdaFunction', url: `${process.env.NEXT_PUBLIC_LambdaFunctionUrl}public` },
        { name: 'cloudFront', url: `${process.env.NEXT_PUBLIC_CloudFrontDistributionUrl}/public` },
      ]

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
          })
          .catch((error) => console.error(`Error fetching ${name}:`, error))
      })
    }, 1000)

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
      <Paragraph>
        Check dev tools network tab. Note that this is deployed to us-west-2, and the latency is only observable in cross-region requests.
      </Paragraph>
    </div>
  )
}
