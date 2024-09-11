'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { Breadcrumb, Button } from 'antd'
import { HomeOutlined, AppstoreOutlined, PlusOutlined } from '@ant-design/icons'
import TagsTable from '@/components/Tag/TagsTable'
import TagUpsertModal from '@/components/Tag/TagUpsertModal'
import getPageTitle from '@/ui/lib/getPageTitle'
import AuthenticatedPage from '@/ui/components/layouts/AuthenticatedPage'

export default function TagsMasterPage() {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <AuthenticatedPage>
      <Head>
        <title>{getPageTitle({ pageTitle: 'Tags' })}</title>
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
                <span>Tags</span>
              </>
            ),
          },
        ]}
      />
      <div className="toolbar">
        <Button type="primary" onClick={showUpsertModal} icon={<PlusOutlined />}>
          Create Tag
        </Button>
      </div>
      <TagUpsertModal isOpen={isUpsertModalVisible} setIsOpen={setIsUpsertModalVisible} />
      <TagsTable />
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
