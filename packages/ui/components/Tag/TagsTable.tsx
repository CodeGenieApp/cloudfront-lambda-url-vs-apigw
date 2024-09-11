'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useListTagsQuery, type TagData } from './tagHooks'
import TagUpsertModal from './TagUpsertModal'
import TagDeleteModal from './TagDeleteModal'
import AvatarNameLink from '../AvatarNameLink'
import RelativeDateWithAbsoluteHover from '../RelativeDateWithAbsoluteHover'
import { usePagination } from '../../lib/usePagination'
import { DEFAULT_PAGE_SIZE } from '@/common/pagination'
import { useCurrentUserQuery, useIsAdminQuery } from '../Me/meHooks'

export default function TagsTable({ ...restProps }) {
  const [selectedForEdit, setSelectedForEdit] = useState<any | null>()
  const [selectedForDelete, setSelectedForDelete] = useState<any | null>()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [previousPage, setPreviousPage] = useState<any | null>()
  const listTagsQuery = useListTagsQuery({
    page: currentPageIndex,
    lastEvaluatedKey: previousPage?.lastEvaluatedKey,
  })
  const { pages, totalPagedItemsPlusOneIfHasMorePages } = usePagination({
    items: listTagsQuery?.data?.data,
    lastEvaluatedKey: listTagsQuery?.data?.lastEvaluatedKey,
    currentPageIndex,
  })
  const currentUserQuery = useCurrentUserQuery()
  const currentUserId = currentUserQuery.data?.userId
  const isAdminQuery = useIsAdminQuery()
  const { isAdmin } = isAdminQuery

  const columns: ColumnsType<TagData> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render(name, tag) {
        const { tagId } = tag
        const linkText = name || tagId
        return <Link href={`/tags/${tagId}`}>{linkText}</Link>
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render(createdAt) {
        return <RelativeDateWithAbsoluteHover date={createdAt} />
      },
    },
    {
      title: 'Created By User',
      dataIndex: ['createdByUser', 'name'],
      key: 'userName',
      render(userName, tag) {
        const userId = tag?.createdByUser?.userId
        return (
          <AvatarNameLink
            name={tag.createdByUser?.name}
            image={tag.createdByUser?.profilePicture}
            imageAlt="Profile Picture"
            linkRoute={`/users/${userId}`}
            avatarProps={{
              size: 30,
              style: { minWidth: 30 },
            }}
          />
        )
      },
    },
    {
      title: '',
      key: 'actionButtons',
      align: 'right',
      width: 100,
      render(text, tag) {
        const canEdit = isAdmin
        const canDelete = isAdmin
        return (
          <Space>
            {canEdit ?
              <Button icon={<EditOutlined />} onClick={() => setSelectedForEdit(tag)} />
            : null}
            {canDelete ?
              <Button icon={<DeleteOutlined />} onClick={() => setSelectedForDelete(tag)} danger />
            : null}
          </Space>
        )
      },
    },
  ]

  function onPaginate(pageNumber) {
    const pageNumberIndex = pageNumber - 1
    setPreviousPage(pages[pageNumberIndex - 1])
    setCurrentPageIndex(pageNumberIndex)
  }

  return (
    <>
      <TagUpsertModal isOpen={Boolean(selectedForEdit)} setIsOpen={() => setSelectedForEdit(null)} tag={selectedForEdit} />
      <TagDeleteModal onDelete={() => setSelectedForDelete(null)} onCancel={() => setSelectedForDelete(null)} tag={selectedForDelete} />
      <Table
        loading={listTagsQuery.isLoading}
        dataSource={listTagsQuery.data?.data}
        rowKey="tagId"
        size="small"
        columns={columns}
        pagination={{
          position: ['bottomRight'],
          pageSize: DEFAULT_PAGE_SIZE,
          onChange: onPaginate,
          total: totalPagedItemsPlusOneIfHasMorePages,
        }}
        // scroll={{ x: 600 }}
        {...restProps}
      />
      <style jsx global>{`
        .ant-table-wrapper .ant-table.ant-table-small .ant-table-tbody .ant-table-wrapper:only-child .ant-table {
          margin: 0;
        }
      `}</style>
    </>
  )
}
