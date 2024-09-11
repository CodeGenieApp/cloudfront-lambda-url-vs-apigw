'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { SaveOutlined } from '@ant-design/icons'
import { Button, Form, Modal, Input } from 'antd'
import { useCreateTagMutation, useUpdateTagMutation } from './tagHooks'

const DEFAULT_VALUES = {}

interface TagUpsertModalParams {
  isOpen: boolean
  tag?: any
  setIsOpen: any
}

export default function TagUpsertModal({ isOpen, tag, setIsOpen }: TagUpsertModalParams) {
  const isEdit = Boolean(tag)
  const useUpsertMutation = isEdit ? useUpdateTagMutation : useCreateTagMutation
  const upsertTagMutation = useUpsertMutation({ tagId: tag?.tagId })

  function onCancel() {
    setIsOpen(false)
  }

  return (
    <Modal
      centered
      title="Tag"
      open={isOpen}
      destroyOnClose
      onCancel={onCancel}
      footer={[
        <Button key="cancel" disabled={upsertTagMutation.isLoading} onClick={onCancel}>
          Cancel
        </Button>,
        <Button type="primary" form="tag" key="submit" htmlType="submit" loading={upsertTagMutation.isLoading} icon={<SaveOutlined />}>
          {isEdit ? 'Update Tag' : 'Create Tag'}
        </Button>,
      ]}
    >
      <TagUpsertForm tag={tag} onEdit={() => setIsOpen(false)} upsertTagMutation={upsertTagMutation} />
    </Modal>
  )
}

function TagUpsertForm({ tag, onEdit, upsertTagMutation, shouldNavigateToDetailsPageOnCreate = true }) {
  const isEdit = Boolean(tag)
  const router = useRouter()
  const [tagForm] = Form.useForm()

  // When editing multiple records on the same page, we need to call resetFields,
  // otherwise the form lags behind, showing the previously selected record's values.
  // https://github.com/ant-design/ant-design/issues/22372
  useEffect(() => {
    tagForm.resetFields()
  }, [tag?.tagId])

  async function submitForm() {
    await tagForm.validateFields()
    const changes = tagForm.getFieldsValue({ filter: (meta) => meta.touched })

    if (!Object.keys(changes).length) {
      onEdit()
      return
    }

    const mutationData: any = {
      data: changes,
    }

    const response = await upsertTagMutation.mutateAsync(mutationData)

    if (response) {
      if (!tag && shouldNavigateToDetailsPageOnCreate) {
        router.push(`/tags/${response.data.data.tagId}`)
      } else {
        onEdit()
      }
    }
  }

  const initialValues =
    isEdit ?
      {
        ...DEFAULT_VALUES,
        ...tag,
      }
    : DEFAULT_VALUES

  return (
    <Form
      name="tag"
      preserve={false}
      initialValues={initialValues}
      form={tagForm}
      onFinish={submitForm}
      layout="vertical"
      disabled={upsertTagMutation.isLoading}
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
