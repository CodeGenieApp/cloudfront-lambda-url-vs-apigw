import React, { useState } from 'react'
import { Select, Spin } from 'antd'
import type { SelectProps } from 'antd/es/select'
import debounce from 'lodash.debounce'
import { useSearchTagsQuery } from './tagHooks'

export interface SelectTagParams<ValueType = any> extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  debounceTimeout?: number
  multiple?: boolean
  isRequired?: boolean
}

interface KeyLabel {
  key?: string
  label: React.ReactNode
  value: string | number
}

export function SelectTag<ValueType extends KeyLabel = any>({
  debounceTimeout = 360,
  multiple = false,
  isRequired = false,
  ...props
}: SelectTagParams<ValueType>) {
  const [searchValue, setSearchValue] = useState<string>()
  const searchTagsQuery = useSearchTagsQuery({ name: searchValue })
  const searchTagsQueryData = searchTagsQuery?.data?.data ?? []
  const tagOptions = (
    <>
      {multiple || isRequired ? null : (
        <Select.Option value={''} label="None">
          <em>None</em>
        </Select.Option>
      )}
      {searchTagsQueryData.map((tag) => (
        <Select.Option key={tag.tagId} value={tag.tagId} label={tag.name}>
          {tag.name}
        </Select.Option>
      ))}
    </>
  )

  const debouncedSetSearchValue = debounce((v: string) => {
    setSearchValue(v)
  }, debounceTimeout)

  const notFoundContent = (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      {searchTagsQuery?.isFetching ?
        <span>
          <Spin />
          <span style={{ paddingLeft: '1rem' }}>Searching for Tags...</span>
        </span>
      : 'No Tags found'}
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
      loading={searchTagsQuery?.isFetching}
      notFoundContent={notFoundContent}
      onSearch={debouncedSetSearchValue}
      {...props}
    >
      {tagOptions}
    </Select>
  )
}
