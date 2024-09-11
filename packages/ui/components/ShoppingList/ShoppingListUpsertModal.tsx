'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { SaveOutlined } from '@ant-design/icons'
import { Button, Form, Modal, Input } from 'antd'
import { useCreateShoppingListMutation, useUpdateShoppingListMutation } from './shoppingListHooks'

const DEFAULT_VALUES = {}

interface ShoppingListUpsertModalParams {
  isOpen: boolean
  shoppingList?: any
  setIsOpen: any
}

export default function ShoppingListUpsertModal({ isOpen, shoppingList, setIsOpen }: ShoppingListUpsertModalParams) {
  const isEdit = Boolean(shoppingList)
  const useUpsertMutation = isEdit ? useUpdateShoppingListMutation : useCreateShoppingListMutation
  const upsertShoppingListMutation = useUpsertMutation({ shoppingListId: shoppingList?.shoppingListId })

  function onCancel() {
    setIsOpen(false)
  }

  return (
    <Modal
      centered
      title="Shopping List"
      open={isOpen}
      destroyOnClose
      onCancel={onCancel}
      footer={[
        <Button key="cancel" disabled={upsertShoppingListMutation.isLoading} onClick={onCancel}>
          Cancel
        </Button>,
        <Button type="primary" form="shoppingList" key="submit" htmlType="submit" loading={upsertShoppingListMutation.isLoading} icon={<SaveOutlined />}>
          {isEdit ? 'Update Shopping list' : 'Create Shopping list'}
        </Button>,
      ]}
    >
      <ShoppingListUpsertForm shoppingList={shoppingList} onEdit={() => setIsOpen(false)} upsertShoppingListMutation={upsertShoppingListMutation} />
    </Modal>
  )
}

function ShoppingListUpsertForm({ shoppingList, onEdit, upsertShoppingListMutation, shouldNavigateToDetailsPageOnCreate = true }) {
  const isEdit = Boolean(shoppingList)
  const router = useRouter()
  const [shoppingListForm] = Form.useForm()

  // When editing multiple records on the same page, we need to call resetFields,
  // otherwise the form lags behind, showing the previously selected record's values.
  // https://github.com/ant-design/ant-design/issues/22372
  useEffect(() => {
    shoppingListForm.resetFields()
  }, [shoppingList?.shoppingListId])

  async function submitForm() {
    await shoppingListForm.validateFields()
    const changes = shoppingListForm.getFieldsValue({ filter: (meta) => meta.touched })

    if (!Object.keys(changes).length) {
      onEdit()
      return
    }

    const mutationData: any = {
      data: changes,
    }

    const response = await upsertShoppingListMutation.mutateAsync(mutationData)

    if (response) {
      if (!shoppingList && shouldNavigateToDetailsPageOnCreate) {
        router.push(`/shopping-lists/${response.data.data.shoppingListId}`)
      } else {
        onEdit()
      }
    }
  }

  const initialValues =
    isEdit ?
      {
        ...DEFAULT_VALUES,
        ...shoppingList,
      }
    : DEFAULT_VALUES

  return (
    <Form
      name="shoppingList"
      preserve={false}
      initialValues={initialValues}
      form={shoppingListForm}
      onFinish={submitForm}
      layout="vertical"
      disabled={upsertShoppingListMutation.isLoading}
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
