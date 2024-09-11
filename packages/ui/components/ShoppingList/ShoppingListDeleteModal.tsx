'use client'

import React from 'react'
import { Modal } from 'antd'
import { useDeleteShoppingListMutation } from './shoppingListHooks'

export default function ShoppingListDeleteModal({ shoppingList, onCancel, onDelete }) {
  const deleteMutation = useDeleteShoppingListMutation({ shoppingListId: shoppingList?.shoppingListId })
  const name = shoppingList?.name

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
      open={Boolean(shoppingList)}
      okText={`Delete ${name}`}
      onOk={onDeleteButtonClick}
      onCancel={onCancel}
      okButtonProps={{
        loading: deleteMutation.isLoading,
        danger: true,
      }}
    >
      Are you sure you want to delete the <strong>ShoppingList</strong>: <strong>{name}</strong>?
    </Modal>
  )
}
