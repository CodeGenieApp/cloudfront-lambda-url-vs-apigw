'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Card, Skeleton, Space } from 'antd'
import TagUpsertModal from './TagUpsertModal'
import TagDeleteModal from './TagDeleteModal'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import TagData from './TagData'

export default function TagDetails({ tag }) {
  return (
    <Space size="large" direction="vertical" style={{ width: '100%' }}>
      <TagDetailsDetails tag={tag} />
    </Space>
  )
}

function TagDetailsDetails({ tag }) {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)
  const [selectedForDelete, setSelectedForDelete] = useState<any | null>()
  const router = useRouter()

  if (!tag) return <Skeleton />

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <Card
      bordered={false}
      title={tag.name}
      extra={
        <Space>
          <Button type="primary" onClick={showUpsertModal} icon={<EditOutlined />}>
            Edit
          </Button>
          <Button key="delete" icon={<DeleteOutlined />} onClick={() => setSelectedForDelete(tag)} danger />
        </Space>
      }
    >
      <TagDeleteModal onDelete={() => router.push('/tags')} onCancel={() => setSelectedForDelete(null)} tag={selectedForDelete} />
      <TagUpsertModal isOpen={isUpsertModalVisible} setIsOpen={setIsUpsertModalVisible} tag={tag} />
      <TagData tag={tag} />
    </Card>
  )
}
