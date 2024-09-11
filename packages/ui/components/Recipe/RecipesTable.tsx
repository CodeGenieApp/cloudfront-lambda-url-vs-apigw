'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button, Space, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useListRecipesQuery, type RecipeData } from './recipeHooks'
import RecipeUpsertModal from './RecipeUpsertModal'
import RecipeDeleteModal from './RecipeDeleteModal'
import AvatarNameLink from '../AvatarNameLink'
import RelativeDateWithAbsoluteHover from '../RelativeDateWithAbsoluteHover'
import { usePagination } from '../../lib/usePagination'
import { DEFAULT_PAGE_SIZE } from '@/common/pagination'
import { useCurrentUserQuery, useIsAdminQuery } from '../Me/meHooks'

export default function RecipesTable({ ...restProps }) {
  const [selectedForEdit, setSelectedForEdit] = useState<any | null>()
  const [selectedForDelete, setSelectedForDelete] = useState<any | null>()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [previousPage, setPreviousPage] = useState<any | null>()
  const listRecipesQuery = useListRecipesQuery({
    page: currentPageIndex,
    lastEvaluatedKey: previousPage?.lastEvaluatedKey,
  })
  const { pages, totalPagedItemsPlusOneIfHasMorePages } = usePagination({
    items: listRecipesQuery?.data?.data,
    lastEvaluatedKey: listRecipesQuery?.data?.lastEvaluatedKey,
    currentPageIndex,
  })
  const currentUserQuery = useCurrentUserQuery()
  const currentUserId = currentUserQuery.data?.userId
  const isAdminQuery = useIsAdminQuery()
  const { isAdmin } = isAdminQuery

  const columns: ColumnsType<RecipeData> = [
    {
      title: 'Created Date',
      dataIndex: 'createdDate',
      key: 'createdDate',
      render(createdDate) {
        return <RelativeDateWithAbsoluteHover date={createdDate} />
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Tags',
      dataIndex: ['tags', 'name'],
      key: 'tagName',
      render(tagName, recipe) {
        const tagId = recipe?.tags?.tagId
        return (
          <Link style={{ display: 'flex', alignItems: 'center' }} href={`/tags/${tagId}`}>
            {tagName}
          </Link>
        )
      },
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render(title, recipe) {
        const { recipeId } = recipe
        const linkText = title || recipeId
        return (
          <AvatarNameLink
            name={linkText}
            image={recipe.image}
            imageAlt="Image"
            avatarProps={{
              size: 30,
              style: { minWidth: 30 },
            }}
            linkRoute={`/recipes/${recipeId}`}
          />
        )
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
      render(userName, recipe) {
        const userId = recipe?.createdByUser?.userId
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
      render(text, recipe) {
        const canEdit = isAdmin || recipe.createdByUserId === currentUserId
        const canDelete = isAdmin || recipe.createdByUserId === currentUserId
        return (
          <Space>
            {canEdit ?
              <Button icon={<EditOutlined />} onClick={() => setSelectedForEdit(recipe)} />
            : null}
            {canDelete ?
              <Button icon={<DeleteOutlined />} onClick={() => setSelectedForDelete(recipe)} danger />
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
      <RecipeUpsertModal isOpen={Boolean(selectedForEdit)} setIsOpen={() => setSelectedForEdit(null)} recipe={selectedForEdit} />
      <RecipeDeleteModal onDelete={() => setSelectedForDelete(null)} onCancel={() => setSelectedForDelete(null)} recipe={selectedForDelete} />
      <Table
        loading={listRecipesQuery.isLoading}
        dataSource={listRecipesQuery.data?.data}
        rowKey="recipeId"
        size="small"
        columns={columns}
        pagination={{
          position: ['bottomRight'],
          pageSize: DEFAULT_PAGE_SIZE,
          onChange: onPaginate,
          total: totalPagedItemsPlusOneIfHasMorePages,
        }}
        // scroll={{ x: 1200 }}
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
