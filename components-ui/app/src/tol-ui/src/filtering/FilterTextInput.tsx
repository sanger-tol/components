/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { Input, InputGroup, Dropdown } from 'rsuite';
import SearchIcon from '@rsuite/icons/Search';
import { stopPropagation } from '../general/Utils';
import { Filter } from './Filter';
import { updateFilter, filterListener, operatorListener } from './Utils';


function FilterTextInput(props: Filter) {
  const { attribute, componentId, rename, type, zone, setZone } = props;
  // contains filtering needs adding to specific datasources
  const [value, setValue] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [operator, setOperator] = useState(type === 'str' ? '' : '=');
  const [timeoutValue, setTimeoutValue] = useState<any>(null);

  const getOperator = (operator: string) => {
    switch(operator) {
    case '=':
    case '≠':
      return 'eq';
    case '<':
      return 'lt';
    case '≤':
      return 'lte';
    case '>':
      return 'gt';
    case '≥':
      return 'gte';
    default:
      return 'contains';
    }
  };

  const isNegated = (operator: string) => {
    return operator === '≠';
  };

  operatorListener({
    attribute: attribute,
    componentId: componentId,
    operator: getOperator(operator),
    zone: zone,
    setValue: setValue,
    setDisabled: setDisabled,
    type: type
  }, [operator]);

  filterListener({
    attribute: attribute,
    componentId: componentId,
    operators: [getOperator(operator)],
    zone: zone,
    setValue: setValue,
    setDisabled: setDisabled,
    emptyValue: '',
    zoneToValue: (filterValue: any) => {
      return filterValue;
    }
  }, [zone]);

  const validateInput = (input: string) => {
    const intRegex = /^[-]?[0-9\b]*$|^$/;
    const floatRegex = /^[-]?\d*(\.\d*)?$|^$/;
    if (type === 'int' && !input.match(intRegex)) {
      return true;
    } else if (type === 'float' && !input.match(floatRegex)) {
      return true;
    }
  };

  const onFilter = (input: string) => {
    if (validateInput(input)) {
      return;
    }
    setValue(input);
    // can start with minus or period but won't call endpoint
    if (!(input === '-' || input === '.')) {
      clearTimeout(timeoutValue!);
      setTimeoutValue(setTimeout(() => {
        updateFilter({
          operator: getOperator(operator),
          value: input,
          negate: isNegated(operator),
          attribute: attribute,
          componentId: componentId,
          zone: zone,
          empty: '',
        });
        setZone({...zone});
      }, 800));
    }
  };

  const onOperator = (op: string) => {
    setOperator(op);
    updateFilter({
      operator: getOperator(op),
      value: value,
      negate: isNegated(op),
      attribute: attribute,
      componentId: componentId,
      zone: zone,
      empty: '',
    });
    setZone({...zone});
    console.log('setZone', zone);
  };

  const isNum = type === 'int' || type === 'float';
  return (
    <span className={isNum ? 'tol-num-filter' : 'tol-text-filter'} onClick={ stopPropagation }>
      {isNum ?
        <Dropdown title={operator} noCaret>
          <Dropdown.Item onSelect={() => onOperator('=')}>{'='}</Dropdown.Item>
          <Dropdown.Item onSelect={() => onOperator('≠')}>{'≠'}</Dropdown.Item>
          <Dropdown.Item onSelect={() => onOperator('<')}>{'<'}</Dropdown.Item>
          <Dropdown.Item onSelect={() => onOperator('≤')}>{'≤'}</Dropdown.Item>
          <Dropdown.Item onSelect={() => onOperator('>')}>{'>'}</Dropdown.Item>
          <Dropdown.Item onSelect={() => onOperator('≥')}>{'≥'}</Dropdown.Item>
        </Dropdown>
        :
        <></>
      }
      <InputGroup inside>
        <Input
          onChange={onFilter}
          value={value}
          placeholder={rename}
          disabled={disabled}
        />
        <InputGroup.Addon>
          <SearchIcon />
        </InputGroup.Addon>
      </InputGroup>
    </span>
  );
}

export default FilterTextInput;