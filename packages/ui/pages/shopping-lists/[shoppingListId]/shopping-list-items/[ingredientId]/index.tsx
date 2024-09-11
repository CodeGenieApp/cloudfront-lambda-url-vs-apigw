'use client'

import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Breadcrumb } from 'antd'
import { HomeOutlined, AppstoreOutlined } from '@ant-design/icons'
import ShoppingListItemDetails from '@/components/ShoppingListItem/ShoppingListItemDetails'
import { useGetShoppingListQuery } from '@/components/ShoppingList/shoppingListHooks'
import { useGetShoppingListItemQuery } from '@/components/ShoppingListItem/shoppingListItemHooks'
import getPageTitle from '@/ui/lib/getPageTitle'
import AuthenticatedPage from '@/ui/components/layouts/AuthenticatedPage'

export default function ShoppingListItemDetailsPage() {
  const router = useRouter()
  const { shoppingListId, ingredientId } = router.query
  const getShoppingListQuery = useGetShoppingListQuery({ shoppingListId })
  const getShoppingListItemQuery = useGetShoppingListItemQuery({ shoppingListId, ingredientId })

  const shoppingList = getShoppingListQuery.data?.data
  const shoppingListItem = getShoppingListItemQuery.data?.data

  return (
    <AuthenticatedPage>
      <Head>
        <title>{getPageTitle({ pageTitle: shoppingListItem ? `${shoppingListItem.ingredientId} | Shopping List Item` : 'Shopping List Item' })}</title>
      </Head>
      <Breadcrumb
        items={[
          {
            title: (
              <Link href="/" passHref>
                <HomeOutlined />
              </Link>
            ),
          },
          {
            title: (
              <Link href='/shopping-lists' passHref>
                <AppstoreOutlined />{' '}Shopping lists
              </Link>
            ),
          },
          {
            title: (
              <Link href={`/shopping-lists/${shoppingListId}`} passHref>
                {shoppingList?.name}
              </Link>
            ),
          },
          {
            title: shoppingListItem?.ingredientId || shoppingListItem?.ingredientId,
          },
        ]}
      />
      <div className="detailsContainer">
        <ShoppingListItemDetails
          shoppingListItem={shoppingListItem}
          shoppingListId={shoppingListId}
        />
      </div>
      <style jsx>
        {`
          .detailsContainer {
            margin-top: 1rem;
          }
        `}
      </style>
    </AuthenticatedPage>
  )
}
