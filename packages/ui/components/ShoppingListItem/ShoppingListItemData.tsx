'use client'

import React from 'react'
import { Col, Row } from 'antd'
import RelativeDateWithAbsoluteHover from '../RelativeDateWithAbsoluteHover'
import Link from 'next/link'
import AvatarNameLink from '../AvatarNameLink'

export default function ShoppingListItemData({ shoppingListItem, minColSpan = 8 }) {
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
        <div>{shoppingListItem.qty}</div>
      </Col>
      <Col {...colSpans}>
        <div>
          <strong>Created At</strong>
        </div>
        <div>
          <RelativeDateWithAbsoluteHover date={shoppingListItem.createdAt} />
        </div>
      </Col>
      <Col {...colSpans}>
        <div>
          <strong>Created By User</strong>
        </div>
        <div>
          <AvatarNameLink
            name={shoppingListItem.createdByUser?.name}
            image={shoppingListItem.createdByUser?.profilePicture}
            imageAlt="Profile Picture"
            linkRoute={`/users/${shoppingListItem.createdByUser?.userId}`}
          />
        </div>
      </Col>
    </Row>
  )
}
