'use client'

import React from 'react'
import { Col, Row } from 'antd'
import RelativeDateWithAbsoluteHover from '../RelativeDateWithAbsoluteHover'
import Link from 'next/link'
import AvatarNameLink from '../AvatarNameLink'

export default function RecipeIngredientData({ recipeIngredient, minColSpan = 8 }) {
  const colSpans = {
    xs: Math.max(minColSpan, 24),
    sm: Math.max(minColSpan, 12),
    xl: Math.max(minColSpan, 8),
  }
  return (
    <Row gutter={[48, 24]}>
      <Col {...colSpans}>
        <div>
          <strong>Qty</strong>
        </div>
        <div>{recipeIngredient.qty}</div>
      </Col>
      <Col {...colSpans}>
        <div>
          <strong>Unit</strong>
        </div>
        <div>{recipeIngredient.unit}</div>
      </Col>
      <Col {...colSpans}>
        <div>
          <strong>Created At</strong>
        </div>
        <div>
          <RelativeDateWithAbsoluteHover date={recipeIngredient.createdAt} />
        </div>
      </Col>
      <Col {...colSpans}>
        <div>
          <strong>Created By User</strong>
        </div>
        <div>
          <AvatarNameLink
            name={recipeIngredient.createdByUser?.name}
            image={recipeIngredient.createdByUser?.profilePicture}
            imageAlt="Profile Picture"
            linkRoute={`/users/${recipeIngredient.createdByUser?.userId}`}
          />
        </div>
      </Col>
    </Row>
  )
}
