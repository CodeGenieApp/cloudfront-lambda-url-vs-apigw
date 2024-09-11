'use client'

import React from 'react'
import { Col, Row } from 'antd'
import RelativeDateWithAbsoluteHover from '../RelativeDateWithAbsoluteHover'

export default function UserData({ user, minColSpan = 12 }) {
  const colSpans = {
    xs: Math.max(minColSpan, 24),
    sm: Math.max(minColSpan, 12),
    xl: Math.max(minColSpan, 8),
  }
  return (
    <Row gutter={[48, 24]}>
      <Col {...colSpans}>
        <div>
          <strong>Email</strong>
        </div>
        <div>
          <a href={`mailto:${user.email}`} target="_blank" rel="noopener noreferrer">
            {user.email}
          </a>
        </div>
      </Col>
      <Col {...colSpans}>
        <div>
          <strong>Created At</strong>
        </div>
        <div>
          <RelativeDateWithAbsoluteHover date={user.createdAt} />
        </div>
      </Col>
      <Col xs={24}>
        <div>
          <strong>Profile Picture</strong>
        </div>
        {user.profilePicture ? (
          <div style={{ textAlign: 'center' }}>
            <img src={user.profilePicture} style={{ maxWidth: '100%' }} />
          </div>
        ) : (
          <em>None</em>
        )}
      </Col>
    </Row>
  )
}
