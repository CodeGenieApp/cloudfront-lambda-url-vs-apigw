'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Card, Skeleton, Space } from 'antd'
import StepUpsertModal from './StepUpsertModal'
import StepDeleteModal from './StepDeleteModal'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import StepData from './StepData'

export default function StepDetails({ recipeId, step }) {
  return (
    <Space size="large" direction="vertical" style={{ width: '100%' }}>
      <StepDetailsDetails recipeId={recipeId} step={step} />
    </Space>
  )
}

function StepDetailsDetails({ recipeId, step }) {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)
  const [selectedForDelete, setSelectedForDelete] = useState<any | null>()
  const router = useRouter()

  if (!step) return <Skeleton />

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <Card
      bordered={false}
      title={step.stepId}
      extra={
        <Space>
          <Button type="primary" onClick={showUpsertModal} icon={<EditOutlined />}>
            Edit
          </Button>
          <Button key="delete" icon={<DeleteOutlined />} onClick={() => setSelectedForDelete(step)} danger />
        </Space>
      }
    >
      <StepDeleteModal onDelete={() => router.push(`/recipes/${recipeId}/steps`)} onCancel={() => setSelectedForDelete(null)} step={selectedForDelete} />
      <StepUpsertModal isOpen={isUpsertModalVisible} setIsOpen={setIsUpsertModalVisible} step={step} recipeId={step.recipeId} />
      <StepData step={step} />
    </Card>
  )
}
