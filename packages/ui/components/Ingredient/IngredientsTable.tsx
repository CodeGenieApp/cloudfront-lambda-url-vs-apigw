'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useListIngredientsQuery, type IngredientData } from './ingredientHooks'
import IngredientUpsertModal from './IngredientUpsertModal'
import IngredientDeleteModal from './IngredientDeleteModal'
import AvatarNameLink from '../AvatarNameLink'
import RelativeDateWithAbsoluteHover from '../RelativeDateWithAbsoluteHover'
import { usePagination } from '../../lib/usePagination'
import { DEFAULT_PAGE_SIZE } from '@/common/pagination'
import { useCurrentUserQuery, useIsAdminQuery } from '../Me/meHooks'

export default function IngredientsTable({ ...restProps }) {
  const [selectedForEdit, setSelectedForEdit] = useState<any | null>()
  const [selectedForDelete, setSelectedForDelete] = useState<any | null>()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [previousPage, setPreviousPage] = useState<any | null>()
  const listIngredientsQuery = useListIngredientsQuery({
    page: currentPageIndex,
    lastEvaluatedKey: previousPage?.lastEvaluatedKey,
  })
  const { pages, totalPagedItemsPlusOneIfHasMorePages } = usePagination({
    items: listIngredientsQuery?.data?.data,
    lastEvaluatedKey: listIngredientsQuery?.data?.lastEvaluatedKey,
    currentPageIndex,
  })
  const currentUserQuery = useCurrentUserQuery()
  const currentUserId = currentUserQuery.data?.userId
  const isAdminQuery = useIsAdminQuery()
  const { isAdmin } = isAdminQuery

  const columns: ColumnsType<IngredientData> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
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
      render(userName, ingredient) {
        const userId = ingredient?.createdByUser?.userId
        return (
          <AvatarNameLink
            name={ingredient.createdByUser?.name}
            image={ingredient.createdByUser?.profilePicture}
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
      render(text, ingredient) {
        const canEdit = isAdmin || ingredient.createdByUserId === currentUserId
        const canDelete = isAdmin || ingredient.createdByUserId === currentUserId
        return (
          <Space>
            {canEdit ?
              <Button icon={<EditOutlined />} onClick={() => setSelectedForEdit(ingredient)} />
            : null}
            {canDelete ?
              <Button icon={<DeleteOutlined />} onClick={() => setSelectedForDelete(ingredient)} danger />
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
      <IngredientUpsertModal isOpen={Boolean(selectedForEdit)} setIsOpen={() => setSelectedForEdit(null)} ingredient={selectedForEdit} />
      <IngredientDeleteModal onDelete={() => setSelectedForDelete(null)} onCancel={() => setSelectedForDelete(null)} ingredient={selectedForDelete} />
      <Table
        loading={listIngredientsQuery.isLoading}
        dataSource={listIngredientsQuery.data?.data}
        rowKey="ingredientId"
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
