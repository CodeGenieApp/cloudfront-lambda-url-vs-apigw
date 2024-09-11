'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { SaveOutlined } from '@ant-design/icons'
import { Button, Form, Modal, Input, InputNumber, Select } from 'antd'
import { useCreateRecipeIngredientMutation, useUpdateRecipeIngredientMutation } from './recipeIngredientHooks'
import { SelectIngredient } from '../Ingredient/SelectIngredient'

const DEFAULT_VALUES = {}

interface RecipeIngredientUpsertModalParams {
  isOpen: boolean
  recipeId: string
  recipeIngredient?: any
  setIsOpen: any
}

export default function RecipeIngredientUpsertModal({ isOpen, recipeId, recipeIngredient, setIsOpen }: RecipeIngredientUpsertModalParams) {
  const isEdit = Boolean(recipeIngredient)
  const useUpsertMutation = isEdit ? useUpdateRecipeIngredientMutation : useCreateRecipeIngredientMutation
  const upsertRecipeIngredientMutation = useUpsertMutation({ ingredientId: recipeIngredient?.ingredientId, recipeId })

  function onCancel() {
    setIsOpen(false)
  }

  return (
    <Modal
      centered
      title="Recipe Ingredient"
      open={isOpen}
      destroyOnClose
      onCancel={onCancel}
      footer={[
        <Button key="cancel" disabled={upsertRecipeIngredientMutation.isLoading} onClick={onCancel}>
          Cancel
        </Button>,
        <Button type="primary" form="recipeIngredient" key="submit" htmlType="submit" loading={upsertRecipeIngredientMutation.isLoading} icon={<SaveOutlined />}>
          {isEdit ? 'Update Recipe ingredient' : 'Create Recipe ingredient'}
        </Button>,
      ]}
    >
      <RecipeIngredientUpsertForm recipeId={recipeId} recipeIngredient={recipeIngredient} onEdit={() => setIsOpen(false)} upsertRecipeIngredientMutation={upsertRecipeIngredientMutation} />
    </Modal>
  )
}

function RecipeIngredientUpsertForm({ recipeId, recipeIngredient, onEdit, upsertRecipeIngredientMutation, shouldNavigateToDetailsPageOnCreate = true }) {
  const isEdit = Boolean(recipeIngredient)
  const router = useRouter()
  const [recipeIngredientForm] = Form.useForm()

  // When editing multiple records on the same page, we need to call resetFields,
  // otherwise the form lags behind, showing the previously selected record's values.
  // https://github.com/ant-design/ant-design/issues/22372
  useEffect(() => {
    recipeIngredientForm.resetFields()
  }, [recipeIngredient?.ingredientId])

  async function submitForm() {
    await recipeIngredientForm.validateFields()
    const changes = recipeIngredientForm.getFieldsValue({ filter: (meta) => meta.touched })

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

    const response = await upsertRecipeIngredientMutation.mutateAsync(mutationData)

    if (response) {
      if (!recipeIngredient && shouldNavigateToDetailsPageOnCreate) {
        router.push(`/recipes/${recipeId}/recipe-ingredients/${response.data.data.ingredientId}`)
      } else {
        onEdit()
      }
    }
  }

  const initialValues =
    isEdit ?
      {
        ...DEFAULT_VALUES,
        ...recipeIngredient,
      }
    : DEFAULT_VALUES

  return (
    <Form
      name="recipeIngredient"
      preserve={false}
      initialValues={initialValues}
      form={recipeIngredientForm}
      onFinish={submitForm}
      layout="vertical"
      disabled={upsertRecipeIngredientMutation.isLoading}
    >
      <Form.Item
        label="Ingredient"
        name="ingredientId"
        rules={[
          {
            required: true,
            message: 'Required.',
          },
        ]}
      >
        {recipeIngredient ? recipeIngredient.ingredient?.name : <SelectIngredient isRequired />}
      </Form.Item>
      <Form.Item
        label="Qty"
        name="qty"
      >
        <InputNumber />
      </Form.Item>
      <Form.Item
        label="Unit"
        name="unit"
      >
        <Select showSearch>
          <Select.Option value="g">g</Select.Option>
          <Select.Option value="tbsp">tbsp</Select.Option>
          <Select.Option value="tsp">tsp</Select.Option>
          <Select.Option value="cup">cup</Select.Option>
        </Select>
      </Form.Item>
    </Form>
  )
}
