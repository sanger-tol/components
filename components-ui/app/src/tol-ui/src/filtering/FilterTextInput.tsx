/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { Input, InputGroup, Dropdown } from 'rsuite';
import { stopPropagation } from '../general/Utils';
import { Filter } from './Filter';
import { setFilter, filterListener } from './Utils';
import FilterToggle from './FilterToggle';


function FilterTextInput(props: Filter) {
  const { attribute, componentId, rename, type, zone, setZone } = props;
  // contains filtering needs adding to specific datasources
  const [value, setValue] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [operator, setOperator] = useState(type === 'str' ? '' : '=');
  const [exists, setExists] = useState<boolean>(false);
  const [negate, setNegate] = useState<boolean>(false);
  const [timeoutValue, setTimeoutValue] = useState<any>(null);
  const operators = ['=', '<', '>', '≤', '≥'];
  const isNum = type === 'int' || type === 'float';

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

  filterListener({
    attribute: attribute,
    componentId: componentId,
    operators: [getOperator(operator)],
    zone: zone,
    setValue: setValue,
    setDisabled: setDisabled,
    setExists: setExists,
    setNegate: setNegate,
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
    setExists(false);
    // can start with minus or period but won't call endpoint
    if (!(input === '-' || input === '.')) {
      clearTimeout(timeoutValue!);
      setTimeoutValue(setTimeout(() => {
        setFilter({
          operator: getOperator(operator),
          value: input,
          negate: negate,
          attribute: attribute,
          componentId: componentId,
          zone: zone,
          valueExists: input !== '',
        });
        setZone({...zone});
      }, 800));
    }
  };

  const onOperator = (op: string) => {
    // reset value and old operator when changing operator
    setValue('');
    setFilter({
      operator: getOperator(operator), // previous operator
      value: '', // resets value
      negate: negate,
      attribute: attribute,
      componentId: componentId,
      zone: zone,
      valueExists: false
    });
    setOperator(op);
    setZone({...zone});
  };

  const onExists = (ex: boolean) => {
    setExists(!ex);
    setValue('');
    setFilter({
      operator: 'exists',
      negate: negate,
      exists: !ex,
      attribute: attribute,
      componentId: componentId,
      zone: zone
    });
    setZone({...zone});
  };

  const onNegate = (ng: boolean) => {
    setNegate(!ng);
    const op = (exists) ? 'exists' : getOperator(operator);
    setFilter({
      operator: op,
      value: value,
      negate: !ng,
      exists: exists,
      attribute: attribute,
      componentId: componentId,
      zone: zone,
      valueExists: value !== ''
    });
    setZone({...zone});
  };

  return (
    <div className={isNum ? 'tol-num-filter' : 'tol-text-filter'} onClick={ stopPropagation }>
      {isNum ?
        <Dropdown title={operator} noCaret>
          {operators.map((op, i) => {
            if (op !== operator) {
              return (
                <Dropdown.Item
                  key={i}
                  onClick={() => onOperator(op)}
                >
                  {op}
                </Dropdown.Item>
              );
            }
          })}
        </Dropdown>
        :
        <></>
      }
      <InputGroup className={disabled ? 'rs-picker-disabled' : ''} disabled={disabled} inside>
        <Input
          onChange={onFilter}
          value={value}
          placeholder={rename}
        />
      </InputGroup>
      <FilterToggle
        negate={negate}
        onNegate={onNegate}
        exists={exists}
        onExists={onExists}
        disabled={disabled}
      />
    </div>
  );
}

export default FilterTextInput;