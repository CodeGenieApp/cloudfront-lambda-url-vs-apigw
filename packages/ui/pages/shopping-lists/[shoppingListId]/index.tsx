'use client'

import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Breadcrumb } from 'antd'
import { HomeOutlined, AppstoreOutlined } from '@ant-design/icons'
import ShoppingListDetails from '@/components/ShoppingList/ShoppingListDetails'
import { useGetShoppingListQuery } from '@/components/ShoppingList/shoppingListHooks'
import getPageTitle from '@/ui/lib/getPageTitle'
import AuthenticatedPage from '@/ui/components/layouts/AuthenticatedPage'

export default function ShoppingListDetailsPage() {
  const router = useRouter()
  const { shoppingListId } = router.query
  const getShoppingListQuery = useGetShoppingListQuery({ shoppingListId })

  const shoppingList = getShoppingListQuery.data?.data

  return (
    <AuthenticatedPage>
      <Head>
        <title>{getPageTitle({ pageTitle: shoppingList ? `${shoppingList.name} | Shopping List` : 'Shopping List' })}</title>
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
            title: shoppingList?.name || shoppingList?.shoppingListId,
          },
        ]}
      />
      <div className="detailsContainer">
        <ShoppingListDetails
          shoppingList={shoppingList}
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
