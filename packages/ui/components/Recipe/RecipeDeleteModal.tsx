'use client'

import React from 'react'
import { Modal } from 'antd'
import { useDeleteRecipeMutation } from './recipeHooks'

export default function RecipeDeleteModal({ recipe, onCancel, onDelete }) {
  const deleteMutation = useDeleteRecipeMutation({ recipeId: recipe?.recipeId })
  const name = recipe?.title

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
      open={Boolean(recipe)}
      okText={`Delete ${name}`}
      onOk={onDeleteButtonClick}
      onCancel={onCancel}
      okButtonProps={{
        loading: deleteMutation.isLoading,
        danger: true,
      }}
    >
      Are you sure you want to delete the <strong>Recipe</strong>: <strong>{name}</strong>?
    </Modal>
  )
}
