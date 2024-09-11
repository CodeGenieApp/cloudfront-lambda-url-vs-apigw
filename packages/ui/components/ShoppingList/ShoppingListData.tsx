'use client'

import React from 'react'
import { Col, Row } from 'antd'
import RelativeDateWithAbsoluteHover from '../RelativeDateWithAbsoluteHover'
import AvatarNameLink from '../AvatarNameLink'

export default function ShoppingListData({ shoppingList, minColSpan = 12 }) {
  const colSpans = {
    xs: Math.max(minColSpan, 24),
    sm: Math.max(minColSpan, 12),
    xl: Math.max(minColSpan, 8),
  }
  return (
    <Row gutter={[48, 24]}>
      <Col {...colSpans}>
        <div>
          <strong>Created At</strong>
        </div>
        <div>
          <RelativeDateWithAbsoluteHover date={shoppingList.createdAt} />
        </div>
      </Col>
      <Col {...colSpans}>
        <div>
          <strong>Created By User</strong>
        </div>
        <div>
          <AvatarNameLink
            name={shoppingList.createdByUser?.name}
            image={shoppingList.createdByUser?.profilePicture}
            imageAlt="Profile Picture"
            linkRoute={`/users/${shoppingList.createdByUser?.userId}`}
          />
        </div>
      </Col>
    </Row>
  )
}
