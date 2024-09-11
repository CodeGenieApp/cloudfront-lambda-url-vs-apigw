'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Card, Skeleton, Space } from 'antd'
import RecipeIngredientUpsertModal from './RecipeIngredientUpsertModal'
import RecipeIngredientDeleteModal from './RecipeIngredientDeleteModal'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import RecipeIngredientData from './RecipeIngredientData'

export default function RecipeIngredientDetails({ recipeId, recipeIngredient }) {
  return (
    <Space size="large" direction="vertical" style={{ width: '100%' }}>
      <RecipeIngredientDetailsDetails recipeId={recipeId} recipeIngredient={recipeIngredient} />
    </Space>
  )
}

function RecipeIngredientDetailsDetails({ recipeId, recipeIngredient }) {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)
  const [selectedForDelete, setSelectedForDelete] = useState<any | null>()
  const router = useRouter()

  if (!recipeIngredient) return <Skeleton />

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <Card
      bordered={false}
      title={recipeIngredient.ingredient?.name}
      extra={
        <Space>
          <Button type="primary" onClick={showUpsertModal} icon={<EditOutlined />}>
            Edit
          </Button>
          <Button key="delete" icon={<DeleteOutlined />} onClick={() => setSelectedForDelete(recipeIngredient)} danger />
        </Space>
      }
    >
      <RecipeIngredientDeleteModal onDelete={() => router.push(`/recipes/${recipeId}/recipe-ingredients`)} onCancel={() => setSelectedForDelete(null)} recipeIngredient={selectedForDelete} />
      <RecipeIngredientUpsertModal isOpen={isUpsertModalVisible} setIsOpen={setIsUpsertModalVisible} recipeIngredient={recipeIngredient} recipeId={recipeIngredient.recipeId} />
      <RecipeIngredientData recipeIngredient={recipeIngredient} />
    </Card>
  )
}
