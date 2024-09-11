'use client'

import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Breadcrumb } from 'antd'
import { HomeOutlined, AppstoreOutlined } from '@ant-design/icons'
import RecipeIngredientDetails from '@/components/RecipeIngredient/RecipeIngredientDetails'
import { useGetRecipeQuery } from '@/components/Recipe/recipeHooks'
import { useGetRecipeIngredientQuery } from '@/components/RecipeIngredient/recipeIngredientHooks'
import getPageTitle from '@/ui/lib/getPageTitle'
import AuthenticatedPage from '@/ui/components/layouts/AuthenticatedPage'

export default function RecipeIngredientDetailsPage() {
  const router = useRouter()
  const { recipeId, ingredientId } = router.query
  const getRecipeQuery = useGetRecipeQuery({ recipeId })
  const getRecipeIngredientQuery = useGetRecipeIngredientQuery({ recipeId, ingredientId })

  const recipe = getRecipeQuery.data?.data
  const recipeIngredient = getRecipeIngredientQuery.data?.data

  return (
    <AuthenticatedPage>
      <Head>
        <title>{getPageTitle({ pageTitle: recipeIngredient ? `${recipeIngredient.ingredientId} | Recipe Ingredient` : 'Recipe Ingredient' })}</title>
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
            title: recipeIngredient?.ingredientId || recipeIngredient?.ingredientId,
          },
        ]}
      />
      <div className="detailsContainer">
        <RecipeIngredientDetails
          recipeIngredient={recipeIngredient}
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
