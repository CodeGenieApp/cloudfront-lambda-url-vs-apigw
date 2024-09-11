'use client'

import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Breadcrumb } from 'antd'
import { HomeOutlined, AppstoreOutlined } from '@ant-design/icons'
import TagDetails from '@/components/Tag/TagDetails'
import { useGetTagQuery } from '@/components/Tag/tagHooks'
import getPageTitle from '@/ui/lib/getPageTitle'
import AuthenticatedPage from '@/ui/components/layouts/AuthenticatedPage'

export default function TagDetailsPage() {
  const router = useRouter()
  const { tagId } = router.query
  const getTagQuery = useGetTagQuery({ tagId })

  const tag = getTagQuery.data?.data

  return (
    <AuthenticatedPage>
      <Head>
        <title>{getPageTitle({ pageTitle: tag ? `${tag.name} | Tag` : 'Tag' })}</title>
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
              <Link href='/tags' passHref>
                <AppstoreOutlined />{' '}Tags
              </Link>
            ),
          },
          {
            title: tag?.name || tag?.tagId,
          },
        ]}
      />
      <div className="detailsContainer">
        <TagDetails
          tag={tag}
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
