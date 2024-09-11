import React, { useState } from 'react'
import { Select, Spin } from 'antd'
import type { SelectProps } from 'antd/es/select'
import debounce from 'lodash.debounce'
import { useSearchShoppingListItemsQuery } from './shoppingListItemHooks'

export interface SelectShoppingListItemParams<ValueType = any> extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  debounceTimeout?: number
  multiple?: boolean
  isRequired?: boolean
  shoppingListId: string
}

interface KeyLabel {
  key?: string
  label: React.ReactNode
  value: string | number
}

export function SelectShoppingListItem<ValueType extends KeyLabel = any>({
  debounceTimeout = 360,
  multiple = false,
  isRequired = false,
  shoppingListId,
  ...props
}: SelectShoppingListItemParams<ValueType>) {
  const [searchValue, setSearchValue] = useState<string>()
  const searchShoppingListItemsQuery = useSearchShoppingListItemsQuery({ shoppingListId, ingredientId: searchValue })
  const searchShoppingListItemsQueryData = searchShoppingListItemsQuery?.data?.data ?? []
  const shoppingListItemOptions = (
    <>
      {multiple || isRequired ? null : (
        <Select.Option value={''} label="None">
          <em>None</em>
        </Select.Option>
      )}
      {searchShoppingListItemsQueryData.map((shoppingListItem) => (
        <Select.Option key={shoppingListItem.ingredientId} value={shoppingListItem.ingredientId} label={shoppingListItem.ingredientId}>
          {shoppingListItem.ingredientId}
        </Select.Option>
      ))}
    </>
  )

  const debouncedSetSearchValue = debounce((v: string) => {
    setSearchValue(v)
  }, debounceTimeout)

  const notFoundContent = (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      {searchShoppingListItemsQuery?.isFetching ?
        <span>
          <Spin />
          <span style={{ paddingLeft: '1rem' }}>Searching for Shopping list items...</span>
        </span>
      : 'No Shopping list items found'}
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
      loading={searchShoppingListItemsQuery?.isFetching}
      notFoundContent={notFoundContent}
      onSearch={debouncedSetSearchValue}
      {...props}
    >
      {shoppingListItemOptions}
    </Select>
  )
}
