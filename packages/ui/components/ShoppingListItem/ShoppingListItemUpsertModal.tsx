'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { SaveOutlined } from '@ant-design/icons'
import { Button, Form, Modal, Input, InputNumber } from 'antd'
import { useCreateShoppingListItemMutation, useUpdateShoppingListItemMutation } from './shoppingListItemHooks'
import { SelectIngredient } from '../Ingredient/SelectIngredient'

const DEFAULT_VALUES = {}

interface ShoppingListItemUpsertModalParams {
  isOpen: boolean
  shoppingListId: string
  shoppingListItem?: any
  setIsOpen: any
}

export default function ShoppingListItemUpsertModal({ isOpen, shoppingListId, shoppingListItem, setIsOpen }: ShoppingListItemUpsertModalParams) {
  const isEdit = Boolean(shoppingListItem)
  const useUpsertMutation = isEdit ? useUpdateShoppingListItemMutation : useCreateShoppingListItemMutation
  const upsertShoppingListItemMutation = useUpsertMutation({ ingredientId: shoppingListItem?.ingredientId, shoppingListId })

  function onCancel() {
    setIsOpen(false)
  }

  return (
    <Modal
      centered
      title="Shopping List Item"
      open={isOpen}
      destroyOnClose
      onCancel={onCancel}
      footer={[
        <Button key="cancel" disabled={upsertShoppingListItemMutation.isLoading} onClick={onCancel}>
          Cancel
        </Button>,
        <Button type="primary" form="shoppingListItem" key="submit" htmlType="submit" loading={upsertShoppingListItemMutation.isLoading} icon={<SaveOutlined />}>
          {isEdit ? 'Update Shopping list item' : 'Create Shopping list item'}
        </Button>,
      ]}
    >
      <ShoppingListItemUpsertForm shoppingListId={shoppingListId} shoppingListItem={shoppingListItem} onEdit={() => setIsOpen(false)} upsertShoppingListItemMutation={upsertShoppingListItemMutation} />
    </Modal>
  )
}

function ShoppingListItemUpsertForm({ shoppingListId, shoppingListItem, onEdit, upsertShoppingListItemMutation, shouldNavigateToDetailsPageOnCreate = true }) {
  const isEdit = Boolean(shoppingListItem)
  const router = useRouter()
  const [shoppingListItemForm] = Form.useForm()

  // When editing multiple records on the same page, we need to call resetFields,
  // otherwise the form lags behind, showing the previously selected record's values.
  // https://github.com/ant-design/ant-design/issues/22372
  useEffect(() => {
    shoppingListItemForm.resetFields()
  }, [shoppingListItem?.ingredientId])

  async function submitForm() {
    await shoppingListItemForm.validateFields()
    const changes = shoppingListItemForm.getFieldsValue({ filter: (meta) => meta.touched })

    if (!Object.keys(changes).length) {
      onEdit()
      return
    }

    const mutationData: any = {
      data: changes,
    }

    if (!isEdit) {
      mutationData.data.shoppingListId = shoppingListId
    }

    const response = await upsertShoppingListItemMutation.mutateAsync(mutationData)

    if (response) {
      if (!shoppingListItem && shouldNavigateToDetailsPageOnCreate) {
        router.push(`/shopping-lists/${shoppingListId}/shopping-list-items/${response.data.data.ingredientId}`)
      } else {
        onEdit()
      }
    }
  }

  const initialValues =
    isEdit ?
      {
        ...DEFAULT_VALUES,
        ...shoppingListItem,
      }
    : DEFAULT_VALUES

  return (
    <Form
      name="shoppingListItem"
      preserve={false}
      initialValues={initialValues}
      form={shoppingListItemForm}
      onFinish={submitForm}
      layout="vertical"
      disabled={upsertShoppingListItemMutation.isLoading}
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
        {shoppingListItem ? shoppingListItem.ingredient?.name : <SelectIngredient isRequired />}
      </Form.Item>
      <Form.Item
        label="Qty"
        name="qty"
      >
        <InputNumber />
      </Form.Item>
    </Form>
  )
}
