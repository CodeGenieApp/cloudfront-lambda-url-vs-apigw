'use client'

import React from 'react'
import { Col, Row, Space, Tag } from 'antd'
import RelativeDateWithAbsoluteHover from '../RelativeDateWithAbsoluteHover'
import AvatarNameLink from '../AvatarNameLink'

export default function RecipeData({ recipe, minColSpan = 8 }) {
  const colSpans = {
    xs: Math.max(minColSpan, 24),
    sm: Math.max(minColSpan, 12),
    xl: Math.max(minColSpan, 8),
  }
  return (
    <Row gutter={[48, 24]}>
      <Col {...colSpans}>
        <div>
          <strong>Created Date</strong>
        </div>
        <div>
          <RelativeDateWithAbsoluteHover date={recipe.createdDate} />
        </div>
      </Col>
      <Col {...colSpans}>
        <div>
          <strong>Tags</strong>
        </div>
        <div>
          {recipe.tags?.length ?
            <Space wrap>
              {recipe.tags.map((tag) => (
                <Tag key={tag.tagId}>{tag.name}</Tag>
              ))}
            </Space>
          : <em>None</em>}
        </div>
      </Col>
      <Col {...colSpans}>
        <div>
          <strong>Created At</strong>
        </div>
        <div>
          <RelativeDateWithAbsoluteHover date={recipe.createdAt} />
        </div>
      </Col>
      <Col {...colSpans}>
        <div>
          <strong>Created By User</strong>
        </div>
        <div>
          <AvatarNameLink
            name={recipe.createdByUser?.name}
            image={recipe.createdByUser?.profilePicture}
            imageAlt="Profile Picture"
            linkRoute={`/users/${recipe.createdByUser?.userId}`}
          />
        </div>
      </Col>
      <Col xs={24}>
        <div>
          <strong>Description</strong>
        </div>
        <div style={{ whiteSpace: 'pre-line' }}>{recipe.description}</div>
      </Col>
      <Col xs={24}>
        <div>
          <strong>Image</strong>
        </div>
        {recipe.image ? (
          <div style={{ textAlign: 'center' }}>
            <img src={recipe.image} style={{ maxWidth: '100%' }} />
          </div>
        ) : (
          <em>None</em>
        )}
      </Col>
    </Row>
  )
}
