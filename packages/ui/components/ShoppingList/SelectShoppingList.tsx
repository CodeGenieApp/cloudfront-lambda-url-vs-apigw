import React, { useState } from 'react'
import { Select, Spin } from 'antd'
import type { SelectProps } from 'antd/es/select'
import debounce from 'lodash.debounce'
import { useSearchShoppingListsQuery } from './shoppingListHooks'

export interface SelectShoppingListParams<ValueType = any> extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  debounceTimeout?: number
  multiple?: boolean
  isRequired?: boolean
}

interface KeyLabel {
  key?: string
  label: React.ReactNode
  value: string | number
}

export function SelectShoppingList<ValueType extends KeyLabel = any>({
  debounceTimeout = 360,
  multiple = false,
  isRequired = false,
  ...props
}: SelectShoppingListParams<ValueType>) {
  const [searchValue, setSearchValue] = useState<string>()
  const searchShoppingListsQuery = useSearchShoppingListsQuery({ name: searchValue })
  const searchShoppingListsQueryData = searchShoppingListsQuery?.data?.data ?? []
  const shoppingListOptions = (
    <>
      {multiple || isRequired ? null : (
        <Select.Option value={''} label="None">
          <em>None</em>
        </Select.Option>
      )}
      {searchShoppingListsQueryData.map((shoppingList) => (
        <Select.Option key={shoppingList.shoppingListId} value={shoppingList.shoppingListId} label={shoppingList.name}>
          {shoppingList.name}
        </Select.Option>
      ))}
    </>
  )

  const debouncedSetSearchValue = debounce((v: string) => {
    setSearchValue(v)
  }, debounceTimeout)

  const notFoundContent = (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      {searchShoppingListsQuery?.isFetching ?
        <span>
          <Spin />
          <span style={{ paddingLeft: '1rem' }}>Searching for Shopping lists...</span>
        </span>
      : 'No Shopping lists found'}
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
      loading={searchShoppingListsQuery?.isFetching}
      notFoundContent={notFoundContent}
      onSearch={debouncedSetSearchValue}
      {...props}
    >
      {shoppingListOptions}
    </Select>
  )
}
