'use client'

import React from 'react'
import { Modal } from 'antd'
import { useDeleteIngredientMutation } from './ingredientHooks'

export default function IngredientDeleteModal({ ingredient, onCancel, onDelete }) {
  const deleteMutation = useDeleteIngredientMutation({ ingredientId: ingredient?.ingredientId })
  const name = ingredient?.name

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
      open={Boolean(ingredient)}
      okText={`Delete ${name}`}
      onOk={onDeleteButtonClick}
      onCancel={onCancel}
      okButtonProps={{
        loading: deleteMutation.isLoading,
        danger: true,
      }}
    >
      Are you sure you want to delete the <strong>Ingredient</strong>: <strong>{name}</strong>?
    </Modal>
  )
}
