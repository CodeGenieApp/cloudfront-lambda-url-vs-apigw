'use client'

import React from 'react'
import { Modal } from 'antd'
import { useDeleteRecipeIngredientMutation } from './recipeIngredientHooks'

export default function RecipeIngredientDeleteModal({ recipeIngredient, onCancel, onDelete }) {
  const deleteMutation = useDeleteRecipeIngredientMutation({ recipeId: recipeIngredient?.recipeId, ingredientId: recipeIngredient?.ingredientId })
  const name = recipeIngredient?.ingredient?.name

  function onDeleteButtonClick() {
    deleteMutation.mutate(null, {
      onSuccess() {
        onDelete()
      },
    })
  }

  return (
    <Modal
      title={`Delete ${name}`}
      open={Boolean(recipeIngredient)}
      okText={`Delete ${name}`}
      onOk={onDeleteButtonClick}
      onCancel={onCancel}
      okButtonProps={{
        loading: deleteMutation.isLoading,
        danger: true,
      }}
    >
      Are you sure you want to delete the <strong>RecipeIngredient</strong>: <strong>{name}</strong>?
    </Modal>
  )
}
