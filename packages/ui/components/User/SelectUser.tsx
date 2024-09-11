import React, { useState } from 'react'
import { Select, Spin } from 'antd'
import type { SelectProps } from 'antd/es/select'
import debounce from 'lodash.debounce'
import AvatarNameLink from '../AvatarNameLink'
import { useSearchUsersQuery } from './userHooks'

export interface SelectUserParams<ValueType = any> extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  debounceTimeout?: number
  multiple?: boolean
  isRequired?: boolean
}

interface KeyLabel {
  key?: string
  label: React.ReactNode
  value: string | number
}

export function SelectUser<ValueType extends KeyLabel = any>({
  debounceTimeout = 360,
  multiple = false,
  isRequired = false,
  ...props
}: SelectUserParams<ValueType>) {
  const [searchValue, setSearchValue] = useState<string>()
  const searchUsersQuery = useSearchUsersQuery({ name: searchValue })
  const searchUsersQueryData = searchUsersQuery?.data?.data ?? []
  const userOptions = (
    <>
      {multiple || isRequired ? null : (
        <Select.Option value={''} label="None">
          <em>None</em>
        </Select.Option>
      )}
      {searchUsersQueryData.map((user) => (
        <Select.Option key={user.userId} value={user.userId} label={user.name}>
          <AvatarNameLink
            avatarProps={{ size: 30, style: { minWidth: 30 } }}
            image={user.profilePicture}
            imageAlt="Profile Picture"
            name={user.name}
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
      {searchUsersQuery?.isFetching ?
        <span>
          <Spin />
          <span style={{ paddingLeft: '1rem' }}>Searching for Users...</span>
        </span>
      : 'No Users found'}
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
      loading={searchUsersQuery?.isFetching}
      notFoundContent={notFoundContent}
      onSearch={debouncedSetSearchValue}
      {...props}
    >
      {userOptions}
    </Select>
  )
}
