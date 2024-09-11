'use client'

import React from 'react'
import { Modal } from 'antd'
import { useDeleteRecipeRatingMutation } from './recipeRatingHooks'

export default function RecipeRatingDeleteModal({ recipeRating, onCancel, onDelete }) {
  const deleteMutation = useDeleteRecipeRatingMutation({ recipeId: recipeRating?.recipeId, recipeRatingId: recipeRating?.recipeRatingId })
  const name = recipeRating?.recipeRatingId

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
      open={Boolean(recipeRating)}
      okText={`Delete ${name}`}
      onOk={onDeleteButtonClick}
      onCancel={onCancel}
      okButtonProps={{
        loading: deleteMutation.isLoading,
        danger: true,
      }}
    >
      Are you sure you want to delete the <strong>RecipeRating</strong>: <strong>{name}</strong>?
    </Modal>
  )
}
