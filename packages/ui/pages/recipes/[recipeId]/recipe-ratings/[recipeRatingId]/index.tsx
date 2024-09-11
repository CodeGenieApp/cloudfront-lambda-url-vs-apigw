'use client'

import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Breadcrumb } from 'antd'
import { HomeOutlined, AppstoreOutlined } from '@ant-design/icons'
import RecipeRatingDetails from '@/components/RecipeRating/RecipeRatingDetails'
import { useGetRecipeQuery } from '@/components/Recipe/recipeHooks'
import { useGetRecipeRatingQuery } from '@/components/RecipeRating/recipeRatingHooks'
import getPageTitle from '@/ui/lib/getPageTitle'
import AuthenticatedPage from '@/ui/components/layouts/AuthenticatedPage'

export default function RecipeRatingDetailsPage() {
  const router = useRouter()
  const { recipeId, recipeRatingId } = router.query
  const getRecipeQuery = useGetRecipeQuery({ recipeId })
  const getRecipeRatingQuery = useGetRecipeRatingQuery({ recipeId, recipeRatingId })

  const recipe = getRecipeQuery.data?.data
  const recipeRating = getRecipeRatingQuery.data?.data

  return (
    <AuthenticatedPage>
      <Head>
        <title>{getPageTitle({ pageTitle: recipeRating ? `${recipeRating.recipeRatingId} | Recipe Rating` : 'Recipe Rating' })}</title>
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
            title: (
              <Link href={`/recipes/${recipeId}`} passHref>
                {recipe?.title}
              </Link>
            ),
          },
          {
            title: recipeRating?.recipeRatingId || recipeRating?.recipeRatingId,
          },
        ]}
      />
      <div className="detailsContainer">
        <RecipeRatingDetails
          recipeRating={recipeRating}
          recipeId={recipeId}
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
