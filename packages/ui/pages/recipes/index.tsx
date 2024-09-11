'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { Breadcrumb, Button } from 'antd'
import { HomeOutlined, AppstoreOutlined, PlusOutlined } from '@ant-design/icons'
import RecipesTable from '@/components/Recipe/RecipesTable'
import RecipeUpsertModal from '@/components/Recipe/RecipeUpsertModal'
import getPageTitle from '@/ui/lib/getPageTitle'
import AuthenticatedPage from '@/ui/components/layouts/AuthenticatedPage'

export default function RecipesMasterPage() {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <AuthenticatedPage>
      <Head>
        <title>{getPageTitle({ pageTitle: 'Recipes' })}</title>
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
                <span>Recipes</span>
              </>
            ),
          },
        ]}
      />
      <div className="toolbar">
        <Button type="primary" onClick={showUpsertModal} icon={<PlusOutlined />}>
          Create Recipe
        </Button>
      </div>
      <RecipeUpsertModal isOpen={isUpsertModalVisible} setIsOpen={setIsUpsertModalVisible} />
      <RecipesTable />
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
