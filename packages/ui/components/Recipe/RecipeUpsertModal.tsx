'use client'

import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { SaveOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Form, Modal, DatePicker, Input, Upload } from 'antd'
import { useCreateRecipeMutation, useUpdateRecipeMutation } from './recipeHooks'
import { SelectTag } from '../Tag/SelectTag'
import { beforeUpload, customRequest, handleUploadChange } from '@/ui/lib/upload'

const DEFAULT_VALUES = {}

interface RecipeUpsertModalParams {
  isOpen: boolean
  recipe?: any
  setIsOpen: any
}

export default function RecipeUpsertModal({ isOpen, recipe, setIsOpen }: RecipeUpsertModalParams) {
  const isEdit = Boolean(recipe)
  const useUpsertMutation = isEdit ? useUpdateRecipeMutation : useCreateRecipeMutation
  const upsertRecipeMutation = useUpsertMutation({ recipeId: recipe?.recipeId })

  function onCancel() {
    setIsOpen(false)
  }

  return (
    <Modal
      centered
      title="Recipe"
      open={isOpen}
      destroyOnClose
      onCancel={onCancel}
      footer={[
        <Button key="cancel" disabled={upsertRecipeMutation.isLoading} onClick={onCancel}>
          Cancel
        </Button>,
        <Button type="primary" form="recipe" key="submit" htmlType="submit" loading={upsertRecipeMutation.isLoading} icon={<SaveOutlined />}>
          {isEdit ? 'Update Recipe' : 'Create Recipe'}
        </Button>,
      ]}
    >
      <RecipeUpsertForm recipe={recipe} onEdit={() => setIsOpen(false)} upsertRecipeMutation={upsertRecipeMutation} />
    </Modal>
  )
}

function RecipeUpsertForm({ recipe, onEdit, upsertRecipeMutation, shouldNavigateToDetailsPageOnCreate = true }) {
  const isEdit = Boolean(recipe)
  const router = useRouter()
  const [recipeForm] = Form.useForm()
  const [imageBase64Encoded, setImageBase64Encoded] = useState<string>()

  // When editing multiple records on the same page, we need to call resetFields,
  // otherwise the form lags behind, showing the previously selected record's values.
  // https://github.com/ant-design/ant-design/issues/22372
  useEffect(() => {
    recipeForm.resetFields()

    if (isEdit) {
      setImageBase64Encoded(recipe.image)
    }
  }, [recipe?.recipeId])

  async function submitForm() {
    await recipeForm.validateFields()
    const changes = recipeForm.getFieldsValue({ filter: (meta) => meta.touched })

    if (!Object.keys(changes).length) {
      onEdit()
      return
    }

    if (changes.image) {
      changes.image = imageBase64Encoded
    }

    const mutationData: any = {
      data: changes,
    }

    const response = await upsertRecipeMutation.mutateAsync(mutationData)

    if (response) {
      if (!recipe && shouldNavigateToDetailsPageOnCreate) {
        router.push(`/recipes/${response.data.data.recipeId}`)
      } else {
        onEdit()
      }
    }
  }

  const initialValues =
    isEdit ?
      {
        ...DEFAULT_VALUES,
        ...recipe,
    createdDate: recipe.createdDate ? dayjs(new Date(recipe.createdDate)) : undefined,
        image:
          recipe.image ?
            {
              uid: '1',
              status: 'done',
              url: recipe.image,
            }
          : undefined,
      }
    : DEFAULT_VALUES

  return (
    <Form
      name="recipe"
      preserve={false}
      initialValues={initialValues}
      form={recipeForm}
      onFinish={submitForm}
      layout="vertical"
      disabled={upsertRecipeMutation.isLoading}
    >
      <Form.Item
        label="Created Date"
        name="createdDate"
        rules={[
          {
            required: true,
            message: 'Required.',
          },
        ]}
      >
        <DatePicker />
      </Form.Item>
      <Form.Item
        label="Description"
        name="description"
        rules={[
          {
            required: true,
            message: 'Required.',
          },
        ]}
      >
        <Input.TextArea showCount autoSize={{ minRows: 2 }} />
      </Form.Item>
      <Form.Item
        label="Image"
        name="image"
        valuePropName="filesList"
      >
        <Upload
          name="image"
          listType="picture-circle"
          accept=".png, .jpg"
          showUploadList={{ showPreviewIcon: false }}
          customRequest={customRequest}
          beforeUpload={beforeUpload}
          onChange={(info) => handleUploadChange({ info, setBase64Encoded: setImageBase64Encoded })}
          defaultFileList={initialValues.image ? [initialValues.image] : undefined}
        >
          {!imageBase64Encoded ?
            <div>
              <UploadOutlined style={{ fontSize: 24 }} />
            </div>
          : null}
        </Upload>
      </Form.Item>
      <Form.Item
        label="Tags"
        name="tags"
      >
        <SelectTag multiple />
      </Form.Item>
      <Form.Item
        label="Title"
        name="title"
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
