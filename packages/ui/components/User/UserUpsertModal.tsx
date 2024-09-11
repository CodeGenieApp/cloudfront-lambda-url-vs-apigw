'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { SaveOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Form, Modal, Input, Select, Upload } from 'antd'
import { useCreateUserMutation, useUpdateUserMutation } from './userHooks'
import { beforeUpload, customRequest, handleUploadChange } from '@/ui/lib/upload'

const DEFAULT_VALUES = {}

interface UserUpsertModalParams {
  isOpen: boolean
  user?: any
  setIsOpen: any
}

export default function UserUpsertModal({ isOpen, user, setIsOpen }: UserUpsertModalParams) {
  const isEdit = Boolean(user)
  const useUpsertMutation = isEdit ? useUpdateUserMutation : useCreateUserMutation
  const upsertUserMutation = useUpsertMutation({ userId: user?.userId })

  function onCancel() {
    setIsOpen(false)
  }

  return (
    <Modal
      centered
      title="User"
      open={isOpen}
      destroyOnClose
      onCancel={onCancel}
      footer={[
        <Button key="cancel" disabled={upsertUserMutation.isLoading} onClick={onCancel}>
          Cancel
        </Button>,
        <Button type="primary" form="user" key="submit" htmlType="submit" loading={upsertUserMutation.isLoading} icon={<SaveOutlined />}>
          {isEdit ? 'Update User' : 'Create User'}
        </Button>,
      ]}
    >
      <UserUpsertForm user={user} onEdit={() => setIsOpen(false)} upsertUserMutation={upsertUserMutation} />
    </Modal>
  )
}

function UserUpsertForm({ user, onEdit, upsertUserMutation, shouldNavigateToDetailsPageOnCreate = true }) {
  const isEdit = Boolean(user)
  const router = useRouter()
  const [userForm] = Form.useForm()
  const [profilePictureBase64Encoded, setProfilePictureBase64Encoded] = useState<string>()

  // When editing multiple records on the same page, we need to call resetFields,
  // otherwise the form lags behind, showing the previously selected record's values.
  // https://github.com/ant-design/ant-design/issues/22372
  useEffect(() => {
    userForm.resetFields()

    if (isEdit) {
      setProfilePictureBase64Encoded(user.profilePicture)
    }
  }, [user?.userId])

  async function submitForm() {
    await userForm.validateFields()
    const changes = userForm.getFieldsValue({ filter: (meta) => meta.touched })

    if (!Object.keys(changes).length) {
      onEdit()
      return
    }

    if (changes.profilePicture) {
      changes.profilePicture = profilePictureBase64Encoded
    }

    const mutationData: any = {
      data: changes,
    }

    const response = await upsertUserMutation.mutateAsync(mutationData)

    if (response) {
      if (!user && shouldNavigateToDetailsPageOnCreate) {
        router.push(`/users/${response.data.data.userId}`)
      } else {
        onEdit()
      }
    }
  }

  const initialValues =
    isEdit ?
      {
        ...DEFAULT_VALUES,
        ...user,
        profilePicture:
          user.profilePicture ?
            {
              uid: '1',
              status: 'done',
              url: user.profilePicture,
            }
          : undefined,
      }
    : DEFAULT_VALUES

  return (
    <Form
      name="user"
      preserve={false}
      initialValues={initialValues}
      form={userForm}
      onFinish={submitForm}
      layout="vertical"
      disabled={upsertUserMutation.isLoading}
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
      <Form.Item
        label="Email"
        name="email"
        rules={[
          {
            required: true,
            message: 'Required.',
          },
        ]}
      >
        <Input type="email" disabled={isEdit} />
      </Form.Item>
      <Form.Item
        label="Profile Picture"
        name="profilePicture"
        valuePropName="filesList"
      >
        <Upload
          name="profilePicture"
          listType="picture-circle"
          accept=".png, .jpg"
          showUploadList={{ showPreviewIcon: false }}
          customRequest={customRequest}
          beforeUpload={beforeUpload}
          onChange={(info) => handleUploadChange({ info, setBase64Encoded: setProfilePictureBase64Encoded })}
          defaultFileList={initialValues.profilePicture ? [initialValues.profilePicture] : undefined}
        >
          {!profilePictureBase64Encoded ?
            <div>
              <UploadOutlined style={{ fontSize: 24 }} />
            </div>
          : null}
        </Upload>
      </Form.Item>
      <Form.Item
        label="Role"
        name="role"
        rules={[
          {
            required: true,
            message: 'Required.',
          },
        ]}
      >
        <Select showSearch disabled={isEdit}>
          <Select.Option value="Admin">Admin</Select.Option>
          <Select.Option value="User">User</Select.Option>
        </Select>
      </Form.Item>
    </Form>
  )
}
