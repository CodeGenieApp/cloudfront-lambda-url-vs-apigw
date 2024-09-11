'use client'

import React from 'react'
import { Col, Row } from 'antd'
import RelativeDateWithAbsoluteHover from '../RelativeDateWithAbsoluteHover'
import AvatarNameLink from '../AvatarNameLink'

export default function StepData({ step, minColSpan = 8 }) {
  const colSpans = {
    xs: Math.max(minColSpan, 24),
    sm: Math.max(minColSpan, 12),
    xl: Math.max(minColSpan, 8),
  }
  return (
    <Row gutter={[48, 24]}>
      <Col {...colSpans}>
        <div>
          <strong>Step Number</strong>
        </div>
        <div>{step.stepNumber}</div>
      </Col>
      <Col {...colSpans}>
        <div>
          <strong>Created At</strong>
        </div>
        <div>
          <RelativeDateWithAbsoluteHover date={step.createdAt} />
        </div>
      </Col>
      <Col {...colSpans}>
        <div>
          <strong>Created By User</strong>
        </div>
        <div>
          <AvatarNameLink
            name={step.createdByUser?.name}
            image={step.createdByUser?.profilePicture}
            imageAlt="Profile Picture"
            linkRoute={`/users/${step.createdByUser?.userId}`}
          />
        </div>
      </Col>
      <Col xs={24}>
        <div>
          <strong>Instructions</strong>
        </div>
        <div style={{ whiteSpace: 'pre-line' }}>{step.instructions}</div>
      </Col>
    </Row>
  )
}
