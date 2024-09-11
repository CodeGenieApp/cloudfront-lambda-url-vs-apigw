'use client'

import React from 'react'
import { Col, Row } from 'antd'
import RelativeDateWithAbsoluteHover from '../RelativeDateWithAbsoluteHover'
import AvatarNameLink from '../AvatarNameLink'

export default function RecipeRatingData({ recipeRating, minColSpan = 8 }) {
  const colSpans = {
    xs: Math.max(minColSpan, 24),
    sm: Math.max(minColSpan, 12),
    xl: Math.max(minColSpan, 8),
  }
  return (
    <Row gutter={[48, 24]}>
      <Col {...colSpans}>
        <div>
          <strong>Created By User</strong>
        </div>
        <div>
          <AvatarNameLink
            name={recipeRating.createdByUser?.name}
            image={recipeRating.createdByUser?.profilePicture}
            imageAlt="Profile Picture"
            linkRoute={`/users/${recipeRating.createdByUser?.userId}`}
          />
        </div>
      </Col>
      <Col {...colSpans}>
        <div>
          <strong>Value</strong>
        </div>
        <div>{recipeRating.value}</div>
      </Col>
      <Col {...colSpans}>
        <div>
          <strong>Created At</strong>
        </div>
        <div>
          <RelativeDateWithAbsoluteHover date={recipeRating.createdAt} />
        </div>
      </Col>
      <Col xs={24}>
        <div>
          <strong>Comment</strong>
        </div>
        <div style={{ whiteSpace: 'pre-line' }}>{recipeRating.comment}</div>
      </Col>
    </Row>
  )
}
