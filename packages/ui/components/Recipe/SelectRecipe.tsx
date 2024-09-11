import React, { useState } from 'react'
import { Select, Spin } from 'antd'
import type { SelectProps } from 'antd/es/select'
import debounce from 'lodash.debounce'
import AvatarNameLink from '../AvatarNameLink'
import { useSearchRecipesQuery } from './recipeHooks'

export interface SelectRecipeParams<ValueType = any> extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  debounceTimeout?: number
  multiple?: boolean
  isRequired?: boolean
}

interface KeyLabel {
  key?: string
  label: React.ReactNode
  value: string | number
}

export function SelectRecipe<ValueType extends KeyLabel = any>({
  debounceTimeout = 360,
  multiple = false,
  isRequired = false,
  ...props
}: SelectRecipeParams<ValueType>) {
  const [searchValue, setSearchValue] = useState<string>()
  const searchRecipesQuery = useSearchRecipesQuery({ title: searchValue })
  const searchRecipesQueryData = searchRecipesQuery?.data?.data ?? []
  const recipeOptions = (
    <>
      {multiple || isRequired ? null : (
        <Select.Option value={''} label="None">
          <em>None</em>
        </Select.Option>
      )}
      {searchRecipesQueryData.map((recipe) => (
        <Select.Option key={recipe.recipeId} value={recipe.recipeId} label={recipe.title}>
          <AvatarNameLink
            avatarProps={{ size: 30, style: { minWidth: 30 } }}
            image={recipe.image}
            imageAlt="Image"
            name={recipe.title}
          />
        </Select.Option>
      ))}
    </>
  )

  const debouncedSetSearchValue = debounce((v: string) => {
    setSearchValue(v)
  }, debounceTimeout)

  const notFoundContent = (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      {searchRecipesQuery?.isFetching ?
        <span>
          <Spin />
          <span style={{ paddingLeft: '1rem' }}>Searching for Recipes...</span>
        </span>
      : 'No Recipes found'}
    </div>
  )

  return (
    <Select
      mode={multiple ? 'multiple' : undefined}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) => (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())}
      filterSort={(optionA, optionB) =>
        optionB?.value === '' ?
          1
        : (optionA?.label?.toString() ?? '').toLowerCase().localeCompare((optionB?.label?.toString() ?? '').toLowerCase())
      }
      loading={searchRecipesQuery?.isFetching}
      notFoundContent={notFoundContent}
      onSearch={debouncedSetSearchValue}
      {...props}
    >
      {recipeOptions}
    </Select>
  )
}
