'use client'

import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Breadcrumb } from 'antd'
import { HomeOutlined, AppstoreOutlined } from '@ant-design/icons'
import RecipeDetails from '@/components/Recipe/RecipeDetails'
import { useGetRecipeQuery } from '@/components/Recipe/recipeHooks'
import getPageTitle from '@/ui/lib/getPageTitle'
import AuthenticatedPage from '@/ui/components/layouts/AuthenticatedPage'

export default function RecipeDetailsPage() {
  const router = useRouter()
  const { recipeId } = router.query
  const getRecipeQuery = useGetRecipeQuery({ recipeId })

  const recipe = getRecipeQuery.data?.data

  return (
    <AuthenticatedPage>
      <Head>
        <title>{getPageTitle({ pageTitle: recipe ? `${recipe.title} | Recipe` : 'Recipe' })}</title>
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
              <Link href='/recipes' passHref>
                <AppstoreOutlined />{' '}Recipes
              </Link>
            ),
          },
          {
            title: recipe?.title || recipe?.recipeId,
          },
        ]}
      />
      <div className="detailsContainer">
        <RecipeDetails
          recipe={recipe}
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
