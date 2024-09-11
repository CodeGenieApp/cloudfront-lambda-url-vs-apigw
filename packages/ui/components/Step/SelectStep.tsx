import React, { useState } from 'react'
import { Select, Spin } from 'antd'
import type { SelectProps } from 'antd/es/select'
import debounce from 'lodash.debounce'
import { useSearchStepsQuery } from './stepHooks'

export interface SelectStepParams<ValueType = any> extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
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

export function SelectStep<ValueType extends KeyLabel = any>({
  debounceTimeout = 360,
  multiple = false,
  isRequired = false,
  recipeId,
  ...props
}: SelectStepParams<ValueType>) {
  const [searchValue, setSearchValue] = useState<string>()
  const searchStepsQuery = useSearchStepsQuery({ recipeId, stepId: searchValue })
  const searchStepsQueryData = searchStepsQuery?.data?.data ?? []
  const stepOptions = (
    <>
      {multiple || isRequired ? null : (
        <Select.Option value={''} label="None">
          <em>None</em>
        </Select.Option>
      )}
      {searchStepsQueryData.map((step) => (
        <Select.Option key={step.stepId} value={step.stepId} label={step.stepId}>
          {step.stepId}
        </Select.Option>
      ))}
    </>
  )

  const debouncedSetSearchValue = debounce((v: string) => {
    setSearchValue(v)
  }, debounceTimeout)

  const notFoundContent = (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      {searchStepsQuery?.isFetching ?
        <span>
          <Spin />
          <span style={{ paddingLeft: '1rem' }}>Searching for Steps...</span>
        </span>
      : 'No Steps found'}
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
      loading={searchStepsQuery?.isFetching}
      notFoundContent={notFoundContent}
      onSearch={debouncedSetSearchValue}
      {...props}
    >
      {stepOptions}
    </Select>
  )
}
