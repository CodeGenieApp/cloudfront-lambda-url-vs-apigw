'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useListShoppingListsQuery, type ShoppingListData } from './shoppingListHooks'
import ShoppingListUpsertModal from './ShoppingListUpsertModal'
import ShoppingListDeleteModal from './ShoppingListDeleteModal'
import AvatarNameLink from '../AvatarNameLink'
import RelativeDateWithAbsoluteHover from '../RelativeDateWithAbsoluteHover'
import { usePagination } from '../../lib/usePagination'
import { DEFAULT_PAGE_SIZE } from '@/common/pagination'
import { useCurrentUserQuery, useIsAdminQuery } from '../Me/meHooks'

export default function ShoppingListsTable({ ...restProps }) {
  const [selectedForEdit, setSelectedForEdit] = useState<any | null>()
  const [selectedForDelete, setSelectedForDelete] = useState<any | null>()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [previousPage, setPreviousPage] = useState<any | null>()
  const listShoppingListsQuery = useListShoppingListsQuery({
    page: currentPageIndex,
    lastEvaluatedKey: previousPage?.lastEvaluatedKey,
  })
  const { pages, totalPagedItemsPlusOneIfHasMorePages } = usePagination({
    items: listShoppingListsQuery?.data?.data,
    lastEvaluatedKey: listShoppingListsQuery?.data?.lastEvaluatedKey,
    currentPageIndex,
  })
  const currentUserQuery = useCurrentUserQuery()
  const currentUserId = currentUserQuery.data?.userId
  const isAdminQuery = useIsAdminQuery()
  const { isAdmin } = isAdminQuery

  const columns: ColumnsType<ShoppingListData> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render(name, shoppingList) {
        const { shoppingListId } = shoppingList
        const linkText = name || shoppingListId
        return <Link href={`/shopping-lists/${shoppingListId}`}>{linkText}</Link>
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
      render(userName, shoppingList) {
        const userId = shoppingList?.createdByUser?.userId
        return (
          <AvatarNameLink
            name={shoppingList.createdByUser?.name}
            image={shoppingList.createdByUser?.profilePicture}
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
      render(text, shoppingList) {
        const canEdit = isAdmin || shoppingList.createdByUserId === currentUserId
        const canDelete = isAdmin || shoppingList.createdByUserId === currentUserId
        return (
          <Space>
            {canEdit ?
              <Button icon={<EditOutlined />} onClick={() => setSelectedForEdit(shoppingList)} />
            : null}
            {canDelete ?
              <Button icon={<DeleteOutlined />} onClick={() => setSelectedForDelete(shoppingList)} danger />
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
      <ShoppingListUpsertModal isOpen={Boolean(selectedForEdit)} setIsOpen={() => setSelectedForEdit(null)} shoppingList={selectedForEdit} />
      <ShoppingListDeleteModal onDelete={() => setSelectedForDelete(null)} onCancel={() => setSelectedForDelete(null)} shoppingList={selectedForDelete} />
      <Table
        loading={listShoppingListsQuery.isLoading}
        dataSource={listShoppingListsQuery.data?.data}
        rowKey="shoppingListId"
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
