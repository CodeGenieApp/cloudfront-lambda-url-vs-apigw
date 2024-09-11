'use client'

import React, { useEffect } from 'react'
import { SaveOutlined } from '@ant-design/icons'
import { Button, Form, Modal, Input } from 'antd'
import { useCreateIngredientMutation, useUpdateIngredientMutation } from './ingredientHooks'

const DEFAULT_VALUES = {}

interface IngredientUpsertModalParams {
  isOpen: boolean
  ingredient?: any
  setIsOpen: any
}

export default function IngredientUpsertModal({ isOpen, ingredient, setIsOpen }: IngredientUpsertModalParams) {
  const isEdit = Boolean(ingredient)
  const useUpsertMutation = isEdit ? useUpdateIngredientMutation : useCreateIngredientMutation
  const upsertIngredientMutation = useUpsertMutation({ ingredientId: ingredient?.ingredientId })

  function onCancel() {
    setIsOpen(false)
  }

  return (
    <Modal
      centered
      title="Ingredient"
      open={isOpen}
      destroyOnClose
      onCancel={onCancel}
      footer={[
        <Button key="cancel" disabled={upsertIngredientMutation.isLoading} onClick={onCancel}>
          Cancel
        </Button>,
        <Button type="primary" form="ingredient" key="submit" htmlType="submit" loading={upsertIngredientMutation.isLoading} icon={<SaveOutlined />}>
          {isEdit ? 'Update Ingredient' : 'Create Ingredient'}
        </Button>,
      ]}
    >
      <IngredientUpsertForm ingredient={ingredient} onEdit={() => setIsOpen(false)} upsertIngredientMutation={upsertIngredientMutation} />
    </Modal>
  )
}

function IngredientUpsertForm({ ingredient, onEdit, upsertIngredientMutation }) {
  const isEdit = Boolean(ingredient)
  const [ingredientForm] = Form.useForm()

  // When editing multiple records on the same page, we need to call resetFields,
  // otherwise the form lags behind, showing the previously selected record's values.
  // https://github.com/ant-design/ant-design/issues/22372
  useEffect(() => {
    ingredientForm.resetFields()
  }, [ingredient?.ingredientId])

  async function submitForm() {
    await ingredientForm.validateFields()
    const changes = ingredientForm.getFieldsValue({ filter: (meta) => meta.touched })

    if (!Object.keys(changes).length) {
      onEdit()
      return
    }

    const mutationData: any = {
      data: changes,
    }

    const response = await upsertIngredientMutation.mutateAsync(mutationData)

    if (response) {
      onEdit()
    }
  }

  const initialValues =
    isEdit ?
      {
        ...DEFAULT_VALUES,
        ...ingredient,
      }
    : DEFAULT_VALUES

  return (
    <Form
      name="ingredient"
      preserve={false}
      initialValues={initialValues}
      form={ingredientForm}
      onFinish={submitForm}
      layout="vertical"
      disabled={upsertIngredientMutation.isLoading}
    >
      <Form.Item
        label="Name"
        name="name"
        rules={[
          {
            required: true,
            message: 'Required.',
          },
        ]}
      >
        <Input />
      </Form.Item>
    </Form>
  )
}
