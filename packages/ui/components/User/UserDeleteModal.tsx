'use client'

import React from 'react'
import { Modal } from 'antd'
import { useDeleteUserMutation } from './userHooks'

export default function UserDeleteModal({ user, onCancel, onDelete }) {
  const deleteMutation = useDeleteUserMutation({ userId: user?.userId })
  const name = user?.name

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
      open={Boolean(user)}
      okText={`Delete ${name}`}
      onOk={onDeleteButtonClick}
      onCancel={onCancel}
      okButtonProps={{
        loading: deleteMutation.isLoading,
        danger: true,
      }}
    >
      Are you sure you want to delete the <strong>User</strong>: <strong>{name}</strong>?
    </Modal>
  )
}
