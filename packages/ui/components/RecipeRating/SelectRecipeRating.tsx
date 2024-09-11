import React, { useState } from 'react'
import { Select, Spin } from 'antd'
import type { SelectProps } from 'antd/es/select'
import debounce from 'lodash.debounce'
import { useSearchRecipeRatingsQuery } from './recipeRatingHooks'

export interface SelectRecipeRatingParams<ValueType = any> extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
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

export function SelectRecipeRating<ValueType extends KeyLabel = any>({
  debounceTimeout = 360,
  multiple = false,
  isRequired = false,
  recipeId,
  ...props
}: SelectRecipeRatingParams<ValueType>) {
  const [searchValue, setSearchValue] = useState<string>()
  const searchRecipeRatingsQuery = useSearchRecipeRatingsQuery({ recipeId, recipeRatingId: searchValue })
  const searchRecipeRatingsQueryData = searchRecipeRatingsQuery?.data?.data ?? []
  const recipeRatingOptions = (
    <>
      {multiple || isRequired ? null : (
        <Select.Option value={''} label="None">
          <em>None</em>
        </Select.Option>
      )}
      {searchRecipeRatingsQueryData.map((recipeRating) => (
        <Select.Option key={recipeRating.recipeRatingId} value={recipeRating.recipeRatingId} label={recipeRating.recipeRatingId}>
          {recipeRating.recipeRatingId}
        </Select.Option>
      ))}
    </>
  )

  const debouncedSetSearchValue = debounce((v: string) => {
    setSearchValue(v)
  }, debounceTimeout)

  const notFoundContent = (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      {searchRecipeRatingsQuery?.isFetching ?
        <span>
          <Spin />
          <span style={{ paddingLeft: '1rem' }}>Searching for Recipe ratings...</span>
        </span>
      : 'No Recipe ratings found'}
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
      loading={searchRecipeRatingsQuery?.isFetching}
      notFoundContent={notFoundContent}
      onSearch={debouncedSetSearchValue}
      {...props}
    >
      {recipeRatingOptions}
    </Select>
  )
}
