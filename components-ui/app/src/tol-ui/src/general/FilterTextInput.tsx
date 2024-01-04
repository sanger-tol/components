/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Input, InputGroup } from 'rsuite';
import SearchIcon from '@rsuite/icons/Search';
import { isEmptyObject, stopPropagation } from './Utils'
import { useEffectUpdate } from "../hooks/useEffectUpdate";


export interface Props {
  id: string,
  rename: string,
  type: 'str'|'int'|'float',
  filter: object,
  setFilter: Function
}

function FilterTextInput(props: Props) {
  const { id, rename, type, filter, setFilter } = props
  // contains filtering needs adding to specific datasources
  const filterType: string = type === 'str' ? 'contains' : 'exact'
  const [value, setValue] = useState('')
  const [timeoutValue, setTimeoutValue] = useState<any>(null)

  // altering filter value if the attribute is filtered on else where
  useEffectUpdate(() => {
    if (filterType in filter && id in filter[filterType]) {
      if (value !== filter[filterType][id]) {
        setValue(filter[filterType][id])
      }
    } else {
      setValue('')
    }
  }, [filter])

  const validateInput = (input: string) => {
    const intRegex = /^[-]?[0-9\b]*$|^$/
    const floatRegex = /^[-]?\d*(\.\d*)?$|^$/
    if (type === 'int' && !input.match(intRegex)) {
      return true
    } else if (type === 'float' && !input.match(floatRegex)) {
      return true
    }
  }

  const onFilter = (input: string) => {
    if (validateInput(input)) { return }
    setValue(input)
    // can start with minus or period but won't call endpoint
    if (!(input === '-' || input === '.')) {
      clearTimeout(timeoutValue!)
      setTimeoutValue(setTimeout(() => {
        // delete filter if input removed
        if (input === '') {
          delete filter[filterType][id]
          // delete filter type if object is empty
          if (isEmptyObject(filter[filterType])) {
            delete filter[filterType]
          }
        } else {
          // if filter type not created
          if (!(filterType in filter)) {
            filter[filterType] = {}
          }
          filter[filterType][id] = input
        }
        setFilter({...filter})
      }, 800))
    }
  }
  
  return (
    <span onClick={ stopPropagation }>
      <InputGroup inside>
        <Input
          onChange={ onFilter }
          value={ value }
          placeholder={ rename }
        />
        <InputGroup.Addon>
          <SearchIcon />
        </InputGroup.Addon>
      </InputGroup>
    </span>
  );
}

export default FilterTextInput;
