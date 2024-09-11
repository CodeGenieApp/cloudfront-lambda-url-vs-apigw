'use client'

import React from 'react'
import { Modal } from 'antd'
import { useDeleteShoppingListItemMutation } from './shoppingListItemHooks'

export default function ShoppingListItemDeleteModal({ shoppingListItem, onCancel, onDelete }) {
  const deleteMutation = useDeleteShoppingListItemMutation({ shoppingListId: shoppingListItem?.shoppingListId, ingredientId: shoppingListItem?.ingredientId })
  const name = shoppingListItem?.ingredient?.name

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
      open={Boolean(shoppingListItem)}
      okText={`Delete ${name}`}
      onOk={onDeleteButtonClick}
      onCancel={onCancel}
      okButtonProps={{
        loading: deleteMutation.isLoading,
        danger: true,
      }}
    >
      Are you sure you want to delete the <strong>ShoppingListItem</strong>: <strong>{name}</strong>?
    </Modal>
  )
}
