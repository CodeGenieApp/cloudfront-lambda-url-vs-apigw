'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Card, Skeleton, Space } from 'antd'
import RecipeRatingUpsertModal from './RecipeRatingUpsertModal'
import RecipeRatingDeleteModal from './RecipeRatingDeleteModal'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import RecipeRatingData from './RecipeRatingData'

export default function RecipeRatingDetails({ recipeId, recipeRating }) {
  return (
    <Space size="large" direction="vertical" style={{ width: '100%' }}>
      <RecipeRatingDetailsDetails recipeId={recipeId} recipeRating={recipeRating} />
    </Space>
  )
}

function RecipeRatingDetailsDetails({ recipeId, recipeRating }) {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)
  const [selectedForDelete, setSelectedForDelete] = useState<any | null>()
  const router = useRouter()

  if (!recipeRating) return <Skeleton />

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <Card
      bordered={false}
      title={recipeRating.recipeRatingId}
      extra={
        <Space>
          <Button type="primary" onClick={showUpsertModal} icon={<EditOutlined />}>
            Edit
          </Button>
          <Button key="delete" icon={<DeleteOutlined />} onClick={() => setSelectedForDelete(recipeRating)} danger />
        </Space>
      }
    >
      <RecipeRatingDeleteModal onDelete={() => router.push(`/recipes/${recipeId}/recipe-ratings`)} onCancel={() => setSelectedForDelete(null)} recipeRating={selectedForDelete} />
      <RecipeRatingUpsertModal isOpen={isUpsertModalVisible} setIsOpen={setIsUpsertModalVisible} recipeRating={recipeRating} recipeId={recipeRating.recipeId} />
      <RecipeRatingData recipeRating={recipeRating} />
    </Card>
  )
}
