'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { Breadcrumb, Button } from 'antd'
import { HomeOutlined, AppstoreOutlined, PlusOutlined } from '@ant-design/icons'
import ShoppingListsTable from '@/components/ShoppingList/ShoppingListsTable'
import ShoppingListUpsertModal from '@/components/ShoppingList/ShoppingListUpsertModal'
import getPageTitle from '@/ui/lib/getPageTitle'
import AuthenticatedPage from '@/ui/components/layouts/AuthenticatedPage'

export default function ShoppingListsMasterPage() {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <AuthenticatedPage>
      <Head>
        <title>{getPageTitle({ pageTitle: 'Shopping lists' })}</title>
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
              <>
                <AppstoreOutlined />
                <span>Shopping lists</span>
              </>
            ),
          },
        ]}
      />
      <div className="toolbar">
        <Button type="primary" onClick={showUpsertModal} icon={<PlusOutlined />}>
          Create Shopping list
        </Button>
      </div>
      <ShoppingListUpsertModal isOpen={isUpsertModalVisible} setIsOpen={setIsUpsertModalVisible} />
      <ShoppingListsTable />
      <style jsx>
        {`
          .toolbar {
            margin-bottom: 1rem;
          }
        `}
      </style>
    </AuthenticatedPage>
  )
}
