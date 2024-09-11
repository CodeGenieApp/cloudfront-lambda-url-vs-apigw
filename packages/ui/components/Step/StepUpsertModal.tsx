'use client'

import React, { useEffect } from 'react'
import { SaveOutlined } from '@ant-design/icons'
import { Button, Form, Modal, Input } from 'antd'
import { useCreateStepMutation, useUpdateStepMutation } from './stepHooks'

const DEFAULT_VALUES = {}

interface StepUpsertModalParams {
  isOpen: boolean
  recipeId: string
  step?: any
  setIsOpen: any
}

export default function StepUpsertModal({ isOpen, recipeId, step, setIsOpen }: StepUpsertModalParams) {
  const isEdit = Boolean(step)
  const useUpsertMutation = isEdit ? useUpdateStepMutation : useCreateStepMutation
  const upsertStepMutation = useUpsertMutation({ stepId: step?.stepId, recipeId })

  function onCancel() {
    setIsOpen(false)
  }

  return (
    <Modal
      centered
      title="Step"
      open={isOpen}
      destroyOnClose
      onCancel={onCancel}
      footer={[
        <Button key="cancel" disabled={upsertStepMutation.isLoading} onClick={onCancel}>
          Cancel
        </Button>,
        <Button type="primary" form="step" key="submit" htmlType="submit" loading={upsertStepMutation.isLoading} icon={<SaveOutlined />}>
          {isEdit ? 'Update Step' : 'Create Step'}
        </Button>,
      ]}
    >
      <StepUpsertForm recipeId={recipeId} step={step} onEdit={() => setIsOpen(false)} upsertStepMutation={upsertStepMutation} />
    </Modal>
  )
}

function StepUpsertForm({ recipeId, step, onEdit, upsertStepMutation }) {
  const isEdit = Boolean(step)
  const [stepForm] = Form.useForm()

  // When editing multiple records on the same page, we need to call resetFields,
  // otherwise the form lags behind, showing the previously selected record's values.
  // https://github.com/ant-design/ant-design/issues/22372
  useEffect(() => {
    stepForm.resetFields()
  }, [step?.stepId])

  async function submitForm() {
    await stepForm.validateFields()
    const changes = stepForm.getFieldsValue({ filter: (meta) => meta.touched })

    if (!Object.keys(changes).length) {
      onEdit()
      return
    }

    const mutationData: any = {
      data: changes,
    }

    if (!isEdit) {
      mutationData.data.recipeId = recipeId
    }

    const response = await upsertStepMutation.mutateAsync(mutationData)

    if (response) {
      onEdit()
    }
  }

  const initialValues =
    isEdit ?
      {
        ...DEFAULT_VALUES,
        ...step,
      }
    : DEFAULT_VALUES

  return (
    <Form
      name="step"
      preserve={false}
      initialValues={initialValues}
      form={stepForm}
      onFinish={submitForm}
      layout="vertical"
      disabled={upsertStepMutation.isLoading}
    >
      <Form.Item
        label="Instructions"
        name="instructions"
      >
        <Input.TextArea showCount autoSize={{ minRows: 2 }} />
      </Form.Item>
      <Form.Item
        label="Step Number"
        name="stepNumber"
      >
        <Input />
      </Form.Item>
    </Form>
  )
}
