'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useListRecipeIngredientsQuery, type RecipeIngredientData } from './recipeIngredientHooks'
import RecipeIngredientUpsertModal from './RecipeIngredientUpsertModal'
import RecipeIngredientDeleteModal from './RecipeIngredientDeleteModal'
import AvatarNameLink from '../AvatarNameLink'
import RelativeDateWithAbsoluteHover from '../RelativeDateWithAbsoluteHover'
import { usePagination } from '../../lib/usePagination'
import { DEFAULT_PAGE_SIZE } from '@/common/pagination'
import { useCurrentUserQuery, useIsAdminQuery } from '../Me/meHooks'

export default function RecipeIngredientsTable({ recipeId, ...restProps }) {
  const [selectedForEdit, setSelectedForEdit] = useState<any | null>()
  const [selectedForDelete, setSelectedForDelete] = useState<any | null>()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [previousPage, setPreviousPage] = useState<any | null>()
  const listRecipeIngredientsQuery = useListRecipeIngredientsQuery({
    page: currentPageIndex,
    lastEvaluatedKey: previousPage?.lastEvaluatedKey,
    recipeId,
  })
  const { pages, totalPagedItemsPlusOneIfHasMorePages } = usePagination({
    items: listRecipeIngredientsQuery?.data?.data,
    lastEvaluatedKey: listRecipeIngredientsQuery?.data?.lastEvaluatedKey,
    currentPageIndex,
  })
  const currentUserQuery = useCurrentUserQuery()
  const currentUserId = currentUserQuery.data?.userId
  const isAdminQuery = useIsAdminQuery()
  const { isAdmin } = isAdminQuery

  const columns: ColumnsType<RecipeIngredientData> = [
    {
      title: 'Ingredient',
      dataIndex: ['ingredient', 'name'],
      key: 'ingredientName',
      render(ingredientId, recipeIngredient) {
        const linkText = ingredientId
        return <Link href={`/recipes/${recipeId}/recipe-ingredients/${ingredientId}`}>{linkText}</Link>
      },
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
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
      render(userName, recipeIngredient) {
        const userId = recipeIngredient?.createdByUser?.userId
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
      render(text, recipeIngredient) {
        const canEdit = isAdmin || recipeIngredient.createdByUserId === currentUserId
        const canDelete = isAdmin || recipeIngredient.createdByUserId === currentUserId
        return (
          <Space>
            {canEdit ?
              <Button icon={<EditOutlined />} onClick={() => setSelectedForEdit(recipeIngredient)} />
            : null}
            {canDelete ?
              <Button icon={<DeleteOutlined />} onClick={() => setSelectedForDelete(recipeIngredient)} danger />
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
      <RecipeIngredientUpsertModal isOpen={Boolean(selectedForEdit)} setIsOpen={() => setSelectedForEdit(null)} recipeIngredient={selectedForEdit}
        recipeId={recipeId} />
      <RecipeIngredientDeleteModal onDelete={() => setSelectedForDelete(null)} onCancel={() => setSelectedForDelete(null)} recipeIngredient={selectedForDelete} />
      <Table
        loading={listRecipeIngredientsQuery.isLoading}
        dataSource={listRecipeIngredientsQuery.data?.data}
        rowKey="ingredientId"
        size="small"
        columns={columns}
        pagination={{
          position: ['bottomRight'],
          pageSize: DEFAULT_PAGE_SIZE,
          onChange: onPaginate,
          total: totalPagedItemsPlusOneIfHasMorePages,
        }}
        // scroll={{ x: 1000 }}
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
