'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { SaveOutlined } from '@ant-design/icons'
import { Button, Form, Modal, Input, InputNumber } from 'antd'
import { useCreateRecipeRatingMutation, useUpdateRecipeRatingMutation } from './recipeRatingHooks'

const DEFAULT_VALUES = {}

interface RecipeRatingUpsertModalParams {
  isOpen: boolean
  recipeId: string
  recipeRating?: any
  setIsOpen: any
}

export default function RecipeRatingUpsertModal({ isOpen, recipeId, recipeRating, setIsOpen }: RecipeRatingUpsertModalParams) {
  const isEdit = Boolean(recipeRating)
  const useUpsertMutation = isEdit ? useUpdateRecipeRatingMutation : useCreateRecipeRatingMutation
  const upsertRecipeRatingMutation = useUpsertMutation({ recipeRatingId: recipeRating?.recipeRatingId, recipeId })

  function onCancel() {
    setIsOpen(false)
  }

  return (
    <Modal
      centered
      title="Recipe Rating"
      open={isOpen}
      destroyOnClose
      onCancel={onCancel}
      footer={[
        <Button key="cancel" disabled={upsertRecipeRatingMutation.isLoading} onClick={onCancel}>
          Cancel
        </Button>,
        <Button type="primary" form="recipeRating" key="submit" htmlType="submit" loading={upsertRecipeRatingMutation.isLoading} icon={<SaveOutlined />}>
          {isEdit ? 'Update Recipe rating' : 'Create Recipe rating'}
        </Button>,
      ]}
    >
      <RecipeRatingUpsertForm recipeId={recipeId} recipeRating={recipeRating} onEdit={() => setIsOpen(false)} upsertRecipeRatingMutation={upsertRecipeRatingMutation} />
    </Modal>
  )
}

function RecipeRatingUpsertForm({ recipeId, recipeRating, onEdit, upsertRecipeRatingMutation, shouldNavigateToDetailsPageOnCreate = true }) {
  const isEdit = Boolean(recipeRating)
  const router = useRouter()
  const [recipeRatingForm] = Form.useForm()

  // When editing multiple records on the same page, we need to call resetFields,
  // otherwise the form lags behind, showing the previously selected record's values.
  // https://github.com/ant-design/ant-design/issues/22372
  useEffect(() => {
    recipeRatingForm.resetFields()
  }, [recipeRating?.recipeRatingId])

  async function submitForm() {
    await recipeRatingForm.validateFields()
    const changes = recipeRatingForm.getFieldsValue({ filter: (meta) => meta.touched })

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

    const response = await upsertRecipeRatingMutation.mutateAsync(mutationData)

    if (response) {
      if (!recipeRating && shouldNavigateToDetailsPageOnCreate) {
        router.push(`/recipes/${recipeId}/recipe-ratings/${response.data.data.recipeRatingId}`)
      } else {
        onEdit()
      }
    }
  }

  const initialValues =
    isEdit ?
      {
        ...DEFAULT_VALUES,
        ...recipeRating,
      }
    : DEFAULT_VALUES

  return (
    <Form
      name="recipeRating"
      preserve={false}
      initialValues={initialValues}
      form={recipeRatingForm}
      onFinish={submitForm}
      layout="vertical"
      disabled={upsertRecipeRatingMutation.isLoading}
    >
      <Form.Item
        label="Comment"
        name="comment"
      >
        <Input.TextArea showCount autoSize={{ minRows: 2 }} />
      </Form.Item>
      <Form.Item
        label="Value"
        name="value"
      >
        <InputNumber min={1} max={5} />
      </Form.Item>
    </Form>
  )
}
