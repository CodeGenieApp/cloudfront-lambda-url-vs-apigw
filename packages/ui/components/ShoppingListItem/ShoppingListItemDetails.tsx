'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Card, Skeleton, Space } from 'antd'
import ShoppingListItemUpsertModal from './ShoppingListItemUpsertModal'
import ShoppingListItemDeleteModal from './ShoppingListItemDeleteModal'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import ShoppingListItemData from './ShoppingListItemData'

export default function ShoppingListItemDetails({ shoppingListId, shoppingListItem }) {
  return (
    <Space size="large" direction="vertical" style={{ width: '100%' }}>
      <ShoppingListItemDetailsDetails shoppingListId={shoppingListId} shoppingListItem={shoppingListItem} />
    </Space>
  )
}

function ShoppingListItemDetailsDetails({ shoppingListId, shoppingListItem }) {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)
  const [selectedForDelete, setSelectedForDelete] = useState<any | null>()
  const router = useRouter()

  if (!shoppingListItem) return <Skeleton />

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <Card
      bordered={false}
      title={shoppingListItem.ingredient?.name}
      extra={
        <Space>
          <Button type="primary" onClick={showUpsertModal} icon={<EditOutlined />}>
            Edit
          </Button>
          <Button key="delete" icon={<DeleteOutlined />} onClick={() => setSelectedForDelete(shoppingListItem)} danger />
        </Space>
      }
    >
      <ShoppingListItemDeleteModal onDelete={() => router.push(`/shopping-lists/${shoppingListId}/shopping-list-items`)} onCancel={() => setSelectedForDelete(null)} shoppingListItem={selectedForDelete} />
      <ShoppingListItemUpsertModal isOpen={isUpsertModalVisible} setIsOpen={setIsUpsertModalVisible} shoppingListItem={shoppingListItem} shoppingListId={shoppingListItem.shoppingListId} />
      <ShoppingListItemData shoppingListItem={shoppingListItem} />
    </Card>
  )
}
