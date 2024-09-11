'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useListShoppingListItemsQuery, type ShoppingListItemData } from './shoppingListItemHooks'
import ShoppingListItemUpsertModal from './ShoppingListItemUpsertModal'
import ShoppingListItemDeleteModal from './ShoppingListItemDeleteModal'
import AvatarNameLink from '../AvatarNameLink'
import RelativeDateWithAbsoluteHover from '../RelativeDateWithAbsoluteHover'
import { usePagination } from '../../lib/usePagination'
import { DEFAULT_PAGE_SIZE } from '@/common/pagination'
import { useCurrentUserQuery, useIsAdminQuery } from '../Me/meHooks'

export default function ShoppingListItemsTable({ shoppingListId, ...restProps }) {
  const [selectedForEdit, setSelectedForEdit] = useState<any | null>()
  const [selectedForDelete, setSelectedForDelete] = useState<any | null>()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [previousPage, setPreviousPage] = useState<any | null>()
  const listShoppingListItemsQuery = useListShoppingListItemsQuery({
    page: currentPageIndex,
    lastEvaluatedKey: previousPage?.lastEvaluatedKey,
    shoppingListId,
  })
  const { pages, totalPagedItemsPlusOneIfHasMorePages } = usePagination({
    items: listShoppingListItemsQuery?.data?.data,
    lastEvaluatedKey: listShoppingListItemsQuery?.data?.lastEvaluatedKey,
    currentPageIndex,
  })
  const currentUserQuery = useCurrentUserQuery()
  const currentUserId = currentUserQuery.data?.userId
  const isAdminQuery = useIsAdminQuery()
  const { isAdmin } = isAdminQuery

  const columns: ColumnsType<ShoppingListItemData> = [
    {
      title: 'Ingredient',
      dataIndex: ['ingredient', 'name'],
      key: 'ingredientName',
      render(ingredientId, shoppingListItem) {
        const linkText = ingredientId
        return <Link href={`/shopping-lists/${shoppingListId}/shopping-list-items/${ingredientId}`}>{linkText}</Link>
      },
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
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
      render(userName, shoppingListItem) {
        const userId = shoppingListItem?.createdByUser?.userId
        return (
          <Link style={{ display: 'flex', alignItems: 'center' }} href={`/users/${userId}`}>
            {userName}
          </Link>
        )
      },
    },
    {
      title: '',
      key: 'actionButtons',
      align: 'right',
      width: 100,
      render(text, shoppingListItem) {
        const canEdit = isAdmin || shoppingListItem.createdByUserId === currentUserId
        const canDelete = isAdmin || shoppingListItem.createdByUserId === currentUserId
        return (
          <Space>
            {canEdit ?
              <Button icon={<EditOutlined />} onClick={() => setSelectedForEdit(shoppingListItem)} />
            : null}
            {canDelete ?
              <Button icon={<DeleteOutlined />} onClick={() => setSelectedForDelete(shoppingListItem)} danger />
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
      <ShoppingListItemUpsertModal isOpen={Boolean(selectedForEdit)} setIsOpen={() => setSelectedForEdit(null)} shoppingListItem={selectedForEdit}
        shoppingListId={shoppingListId} />
      <ShoppingListItemDeleteModal onDelete={() => setSelectedForDelete(null)} onCancel={() => setSelectedForDelete(null)} shoppingListItem={selectedForDelete} />
      <Table
        loading={listShoppingListItemsQuery.isLoading}
        dataSource={listShoppingListItemsQuery.data?.data}
        rowKey="ingredientId"
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
