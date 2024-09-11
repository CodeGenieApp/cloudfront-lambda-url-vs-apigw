'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useListStepsQuery, type StepData } from './stepHooks'
import StepUpsertModal from './StepUpsertModal'
import StepDeleteModal from './StepDeleteModal'
import AvatarNameLink from '../AvatarNameLink'
import RelativeDateWithAbsoluteHover from '../RelativeDateWithAbsoluteHover'
import { usePagination } from '../../lib/usePagination'
import { DEFAULT_PAGE_SIZE } from '@/common/pagination'
import { useCurrentUserQuery, useIsAdminQuery } from '../Me/meHooks'

export default function StepsTable({ recipeId, ...restProps }) {
  const [selectedForEdit, setSelectedForEdit] = useState<any | null>()
  const [selectedForDelete, setSelectedForDelete] = useState<any | null>()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [previousPage, setPreviousPage] = useState<any | null>()
  const listStepsQuery = useListStepsQuery({
    page: currentPageIndex,
    lastEvaluatedKey: previousPage?.lastEvaluatedKey,
    recipeId,
  })
  const { pages, totalPagedItemsPlusOneIfHasMorePages } = usePagination({
    items: listStepsQuery?.data?.data,
    lastEvaluatedKey: listStepsQuery?.data?.lastEvaluatedKey,
    currentPageIndex,
  })
  const currentUserQuery = useCurrentUserQuery()
  const currentUserId = currentUserQuery.data?.userId
  const isAdminQuery = useIsAdminQuery()
  const { isAdmin } = isAdminQuery

  const columns: ColumnsType<StepData> = [
    {
      title: 'Instructions',
      dataIndex: 'instructions',
      key: 'instructions',
    },
    {
      title: 'Step Number',
      dataIndex: 'stepNumber',
      key: 'stepNumber',
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
      render(userName, step) {
        const userId = step?.createdByUser?.userId
        return (
          <AvatarNameLink
            name={step.createdByUser?.name}
            image={step.createdByUser?.profilePicture}
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
      render(text, step) {
        const canEdit = isAdmin || step.createdByUserId === currentUserId
        const canDelete = isAdmin || step.createdByUserId === currentUserId
        return (
          <Space>
            {canEdit ?
              <Button icon={<EditOutlined />} onClick={() => setSelectedForEdit(step)} />
            : null}
            {canDelete ?
              <Button icon={<DeleteOutlined />} onClick={() => setSelectedForDelete(step)} danger />
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
      <StepUpsertModal isOpen={Boolean(selectedForEdit)} setIsOpen={() => setSelectedForEdit(null)} step={selectedForEdit}
        recipeId={recipeId} />
      <StepDeleteModal onDelete={() => setSelectedForDelete(null)} onCancel={() => setSelectedForDelete(null)} step={selectedForDelete} />
      <Table
        loading={listStepsQuery.isLoading}
        dataSource={listStepsQuery.data?.data}
        rowKey="stepId"
        size="small"
        columns={columns}
        pagination={{
          position: ['bottomRight'],
          pageSize: DEFAULT_PAGE_SIZE,
          onChange: onPaginate,
          total: totalPagedItemsPlusOneIfHasMorePages,
        }}
        // scroll={{ x: 800 }}
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
