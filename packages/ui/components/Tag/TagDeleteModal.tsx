'use client'

import React from 'react'
import { Modal } from 'antd'
import { useDeleteTagMutation } from './tagHooks'

export default function TagDeleteModal({ tag, onCancel, onDelete }) {
  const deleteMutation = useDeleteTagMutation({ tagId: tag?.tagId })
  const name = tag?.name

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
      open={Boolean(tag)}
      okText={`Delete ${name}`}
      onOk={onDeleteButtonClick}
      onCancel={onCancel}
      okButtonProps={{
        loading: deleteMutation.isLoading,
        danger: true,
      }}
    >
      Are you sure you want to delete the <strong>Tag</strong>: <strong>{name}</strong>?
    </Modal>
  )
}
