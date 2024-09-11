import React, { useState } from 'react'
import { Select, Spin } from 'antd'
import type { SelectProps } from 'antd/es/select'
import debounce from 'lodash.debounce'
import { useSearchRecipeIngredientsQuery } from './recipeIngredientHooks'

export interface SelectRecipeIngredientParams<ValueType = any> extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  debounceTimeout?: number
  multiple?: boolean
  isRequired?: boolean
  recipeId: string
}

interface KeyLabel {
  key?: string
  label: React.ReactNode
  value: string | number
}

export function SelectRecipeIngredient<ValueType extends KeyLabel = any>({
  debounceTimeout = 360,
  multiple = false,
  isRequired = false,
  recipeId,
  ...props
}: SelectRecipeIngredientParams<ValueType>) {
  const [searchValue, setSearchValue] = useState<string>()
  const searchRecipeIngredientsQuery = useSearchRecipeIngredientsQuery({ recipeId, ingredientId: searchValue })
  const searchRecipeIngredientsQueryData = searchRecipeIngredientsQuery?.data?.data ?? []
  const recipeIngredientOptions = (
    <>
      {multiple || isRequired ? null : (
        <Select.Option value={''} label="None">
          <em>None</em>
        </Select.Option>
      )}
      {searchRecipeIngredientsQueryData.map((recipeIngredient) => (
        <Select.Option key={recipeIngredient.ingredientId} value={recipeIngredient.ingredientId} label={recipeIngredient.ingredientId}>
          {recipeIngredient.ingredientId}
        </Select.Option>
      ))}
    </>
  )

  const debouncedSetSearchValue = debounce((v: string) => {
    setSearchValue(v)
  }, debounceTimeout)

  const notFoundContent = (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      {searchRecipeIngredientsQuery?.isFetching ?
        <span>
          <Spin />
          <span style={{ paddingLeft: '1rem' }}>Searching for Recipe ingredients...</span>
        </span>
      : 'No Recipe ingredients found'}
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
      loading={searchRecipeIngredientsQuery?.isFetching}
      notFoundContent={notFoundContent}
      onSearch={debouncedSetSearchValue}
      {...props}
    >
      {recipeIngredientOptions}
    </Select>
  )
}
