'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { Breadcrumb, Button } from 'antd'
import { HomeOutlined, AppstoreOutlined, PlusOutlined } from '@ant-design/icons'
import IngredientsTable from '@/components/Ingredient/IngredientsTable'
import IngredientUpsertModal from '@/components/Ingredient/IngredientUpsertModal'
import getPageTitle from '@/ui/lib/getPageTitle'
import AuthenticatedPage from '@/ui/components/layouts/AuthenticatedPage'

export default function IngredientsMasterPage() {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <AuthenticatedPage>
      <Head>
        <title>{getPageTitle({ pageTitle: 'Ingredients' })}</title>
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
                <span>Ingredients</span>
              </>
            ),
          },
        ]}
      />
      <div className="toolbar">
        <Button type="primary" onClick={showUpsertModal} icon={<PlusOutlined />}>
          Create Ingredient
        </Button>
      </div>
      <IngredientUpsertModal isOpen={isUpsertModalVisible} setIsOpen={setIsUpsertModalVisible} />
      <IngredientsTable />
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
