'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Card, Skeleton, Space } from 'antd'
import IngredientUpsertModal from './IngredientUpsertModal'
import IngredientDeleteModal from './IngredientDeleteModal'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import IngredientData from './IngredientData'

export default function IngredientDetails({ ingredient }) {
  return (
    <Space size="large" direction="vertical" style={{ width: '100%' }}>
      <IngredientDetailsDetails ingredient={ingredient} />
    </Space>
  )
}

function IngredientDetailsDetails({ ingredient }) {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)
  const [selectedForDelete, setSelectedForDelete] = useState<any | null>()
  const router = useRouter()

  if (!ingredient) return <Skeleton />

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <Card
      bordered={false}
      title={ingredient.name}
      extra={
        <Space>
          <Button type="primary" onClick={showUpsertModal} icon={<EditOutlined />}>
            Edit
          </Button>
          <Button key="delete" icon={<DeleteOutlined />} onClick={() => setSelectedForDelete(ingredient)} danger />
        </Space>
      }
    >
      <IngredientDeleteModal onDelete={() => router.push('/ingredients')} onCancel={() => setSelectedForDelete(null)} ingredient={selectedForDelete} />
      <IngredientUpsertModal isOpen={isUpsertModalVisible} setIsOpen={setIsUpsertModalVisible} ingredient={ingredient} />
      <IngredientData ingredient={ingredient} />
    </Card>
  )
}
