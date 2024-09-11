import React, { useState } from 'react'
import { Select, Spin } from 'antd'
import type { SelectProps } from 'antd/es/select'
import debounce from 'lodash.debounce'
import { useSearchIngredientsQuery } from './ingredientHooks'

export interface SelectIngredientParams<ValueType = any> extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  debounceTimeout?: number
  multiple?: boolean
  isRequired?: boolean
}

interface KeyLabel {
  key?: string
  label: React.ReactNode
  value: string | number
}

export function SelectIngredient<ValueType extends KeyLabel = any>({
  debounceTimeout = 360,
  multiple = false,
  isRequired = false,
  ...props
}: SelectIngredientParams<ValueType>) {
  const [searchValue, setSearchValue] = useState<string>()
  const searchIngredientsQuery = useSearchIngredientsQuery({ name: searchValue })
  const searchIngredientsQueryData = searchIngredientsQuery?.data?.data ?? []
  const ingredientOptions = (
    <>
      {multiple || isRequired ? null : (
        <Select.Option value={''} label="None">
          <em>None</em>
        </Select.Option>
      )}
      {searchIngredientsQueryData.map((ingredient) => (
        <Select.Option key={ingredient.ingredientId} value={ingredient.ingredientId} label={ingredient.name}>
          {ingredient.name}
        </Select.Option>
      ))}
    </>
  )

  const debouncedSetSearchValue = debounce((v: string) => {
    setSearchValue(v)
  }, debounceTimeout)

  const notFoundContent = (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      {searchIngredientsQuery?.isFetching ?
        <span>
          <Spin />
          <span style={{ paddingLeft: '1rem' }}>Searching for Ingredients...</span>
        </span>
      : 'No Ingredients found'}
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
      loading={searchIngredientsQuery?.isFetching}
      notFoundContent={notFoundContent}
      onSearch={debouncedSetSearchValue}
      {...props}
    >
      {ingredientOptions}
    </Select>
  )
}
