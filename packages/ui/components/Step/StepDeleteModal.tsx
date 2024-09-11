'use client'

import React from 'react'
import { Modal } from 'antd'
import { useDeleteStepMutation } from './stepHooks'

export default function StepDeleteModal({ step, onCancel, onDelete }) {
  const deleteMutation = useDeleteStepMutation({ recipeId: step?.recipeId, stepId: step?.stepId })
  const name = step?.stepId

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
      open={Boolean(step)}
      okText={`Delete ${name}`}
      onOk={onDeleteButtonClick}
      onCancel={onCancel}
      okButtonProps={{
        loading: deleteMutation.isLoading,
        danger: true,
      }}
    >
      Are you sure you want to delete the <strong>Step</strong>: <strong>{name}</strong>?
    </Modal>
  )
}
