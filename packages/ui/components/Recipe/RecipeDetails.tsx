'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Card, Skeleton, Space, Tabs, type TabsProps } from 'antd'
import RecipeUpsertModal from './RecipeUpsertModal'
import RecipeDeleteModal from './RecipeDeleteModal'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import RecipeData from './RecipeData'
import RecipeIngredientsTable from '../RecipeIngredient/RecipeIngredientsTable'
import RecipeIngredientUpsertModal from '../RecipeIngredient/RecipeIngredientUpsertModal'
import RecipeRatingsTable from '../RecipeRating/RecipeRatingsTable'
import RecipeRatingUpsertModal from '../RecipeRating/RecipeRatingUpsertModal'
import StepsTable from '../Step/StepsTable'
import StepUpsertModal from '../Step/StepUpsertModal'
import AvatarNameLink from '../AvatarNameLink'

export default function RecipeDetails({ recipe }) {
  const tabItems: TabsProps['items'] = [
    {
      key: 'RecipeIngredients',
      label: 'Recipe ingredients',
      children: (<RecipeIngredients
        recipe={recipe}
      />),
    }, {
      key: 'RecipeRatings',
      label: 'Recipe ratings',
      children: (<RecipeRatings
        recipe={recipe}
      />),
    }, {
      key: 'Steps',
      label: 'Steps',
      children: (<Steps
        recipe={recipe}
      />),
    },
  ]

  return (
    <Space size="large" direction="vertical" style={{ width: '100%' }}>
      <RecipeDetailsDetails recipe={recipe} />
      <Tabs items={tabItems} />
    </Space>
  )
}

function RecipeDetailsDetails({ recipe }) {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)
  const [selectedForDelete, setSelectedForDelete] = useState<any | null>()
  const router = useRouter()

  if (!recipe) return <Skeleton />

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <Card
      bordered={false}
      title={<AvatarNameLink image={recipe.image} imageAlt="Image" name={recipe.title} avatarProps={{ size: 'large' }} />}
      extra={
        <Space>
          <Button type="primary" onClick={showUpsertModal} icon={<EditOutlined />}>
            Edit
          </Button>
          <Button key="delete" icon={<DeleteOutlined />} onClick={() => setSelectedForDelete(recipe)} danger />
        </Space>
      }
    >
      <RecipeDeleteModal onDelete={() => router.push('/recipes')} onCancel={() => setSelectedForDelete(null)} recipe={selectedForDelete} />
      <RecipeUpsertModal isOpen={isUpsertModalVisible} setIsOpen={setIsUpsertModalVisible} recipe={recipe} />
      <RecipeData recipe={recipe} />
    </Card>
  )
}

export function RecipeIngredients({ recipe }) {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)

  if (!recipe) return <Skeleton />

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <Card
      bordered={false}
      title="Recipe ingredients"
      extra={
        <Button type="primary" onClick={showUpsertModal} icon={<PlusOutlined />}>
          Create Recipe Ingredient
        </Button>
      }
      className="cardWithTableBody"
    >
      <RecipeIngredientUpsertModal isOpen={isUpsertModalVisible} setIsOpen={setIsUpsertModalVisible} recipeId={recipe.recipeId} />
      <RecipeIngredientsTable recipeId={recipe.recipeId} />
      <style jsx global>{`
        .cardWithTableBody .ant-card-body {
          padding: 0;
          overflow: auto;
        }
      `}</style>
    </Card>
  )
}

export function RecipeRatings({ recipe }) {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)

  if (!recipe) return <Skeleton />

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <Card
      bordered={false}
      title="Recipe ratings"
      extra={
        <Button type="primary" onClick={showUpsertModal} icon={<PlusOutlined />}>
          Create Recipe Rating
        </Button>
      }
      className="cardWithTableBody"
    >
      <RecipeRatingUpsertModal isOpen={isUpsertModalVisible} setIsOpen={setIsUpsertModalVisible} recipeId={recipe.recipeId} />
      <RecipeRatingsTable recipeId={recipe.recipeId} />
      <style jsx global>{`
        .cardWithTableBody .ant-card-body {
          padding: 0;
          overflow: auto;
        }
      `}</style>
    </Card>
  )
}

export function Steps({ recipe }) {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)

  if (!recipe) return <Skeleton />

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <Card
      bordered={false}
      title="Steps"
      extra={
        <Button type="primary" onClick={showUpsertModal} icon={<PlusOutlined />}>
          Create Step
        </Button>
      }
      className="cardWithTableBody"
    >
      <StepUpsertModal isOpen={isUpsertModalVisible} setIsOpen={setIsUpsertModalVisible} recipeId={recipe.recipeId} />
      <StepsTable recipeId={recipe.recipeId} />
      <style jsx global>{`
        .cardWithTableBody .ant-card-body {
          padding: 0;
          overflow: auto;
        }
      `}</style>
    </Card>
  )
}
