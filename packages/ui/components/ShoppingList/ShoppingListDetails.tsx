'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Card, Skeleton, Space } from 'antd'
import ShoppingListUpsertModal from './ShoppingListUpsertModal'
import ShoppingListDeleteModal from './ShoppingListDeleteModal'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import ShoppingListData from './ShoppingListData'
import ShoppingListItemsTable from '../ShoppingListItem/ShoppingListItemsTable'
import ShoppingListItemUpsertModal from '../ShoppingListItem/ShoppingListItemUpsertModal'

export default function ShoppingListDetails({ shoppingList }) {
  return (
    <Space size="large" direction="vertical" style={{ width: '100%' }}>
      <ShoppingListDetailsDetails shoppingList={shoppingList} />
      <ShoppingListItems shoppingList={shoppingList} />
    </Space>
  )
}

function ShoppingListDetailsDetails({ shoppingList }) {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)
  const [selectedForDelete, setSelectedForDelete] = useState<any | null>()
  const router = useRouter()

  if (!shoppingList) return <Skeleton />

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <Card
      bordered={false}
      title={shoppingList.name}
      extra={
        <Space>
          <Button type="primary" onClick={showUpsertModal} icon={<EditOutlined />}>
            Edit
          </Button>
          <Button key="delete" icon={<DeleteOutlined />} onClick={() => setSelectedForDelete(shoppingList)} danger />
        </Space>
      }
    >
      <ShoppingListDeleteModal onDelete={() => router.push('/shopping-lists')} onCancel={() => setSelectedForDelete(null)} shoppingList={selectedForDelete} />
      <ShoppingListUpsertModal isOpen={isUpsertModalVisible} setIsOpen={setIsUpsertModalVisible} shoppingList={shoppingList} />
      <ShoppingListData shoppingList={shoppingList} />
    </Card>
  )
}

export function ShoppingListItems({ shoppingList }) {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)

  if (!shoppingList) return <Skeleton />

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <Card
      bordered={false}
      title="Shopping list items"
      extra={
        <Button type="primary" onClick={showUpsertModal} icon={<PlusOutlined />}>
          Create Shopping List Item
        </Button>
      }
      className="cardWithTableBody"
    >
      <ShoppingListItemUpsertModal isOpen={isUpsertModalVisible} setIsOpen={setIsUpsertModalVisible} shoppingListId={shoppingList.shoppingListId} />
      <ShoppingListItemsTable shoppingListId={shoppingList.shoppingListId} />
      <style jsx global>{`
        .cardWithTableBody .ant-card-body {
          padding: 0;
          overflow: auto;
        }
      `}</style>
    </Card>
  )
}
