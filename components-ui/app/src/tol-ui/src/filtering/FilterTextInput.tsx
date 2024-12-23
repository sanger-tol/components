/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { Input, InputGroup, Dropdown } from 'rsuite';
import { Button } from '..';
import { stopPropagation } from '../general/Utils';
import { Filter } from './Filter';
import { setFilter, filterListener } from './Utils';
import FilterToggle from './FilterToggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faPlus } from '@fortawesome/free-solid-svg-icons';
import MultipleSelect from '../forms/MultipleSelect';
import Modal from '../general/Modal';


function FilterTextInput(props: Filter) {
  const { attribute, componentId, rename, type, zone, setZone } = props;
  // contains filtering needs adding to specific datasources
  const [values, setValues] = useState(['']);
  const [disabled, setDisabled] = useState(false);
  const [operator, setOperator] = useState(type === 'str' ? '' : '=');
  const [exists, setExists] = useState<boolean>(false);
  const [negate, setNegate] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [listValue, setListValue] = useState<string>('');
  const [timeoutValue, setTimeoutValue] = useState<any>(null);
  const operators = ['=', '<', '>', '≤', '≥'];
  const isNum = type === 'int' || type === 'float';

  const getOperator = (operator: string) => {
    switch(operator) {
    case '=':
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
      if (values.length > 1) return 'in_list';
      return 'contains';
    }
  };

  filterListener({
    attribute: attribute,
    componentId: componentId,
    operators: ['in_list', getOperator(operator)],
    zone: zone,
    setValue: setValues,
    setDisabled: setDisabled,
    setExists: setExists,
    setNegate: setNegate,
    emptyValue: [''],
    zoneToValue: (filterValue: any) => {
      if (Array.isArray(filterValue)) return filterValue;
      return [filterValue];
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
    setValues([input]);
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
          valueExists: input !== ''
        });
        setZone({...zone});
      }, 800));
    }
  };

  const onOperator = (op: string) => {
    // reset value and old operator when changing operator
    setValues(['']);
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
    setValues(['']);
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
    setFilter({
      operator: (exists) ? 'exists' : getOperator(operator),
      value: (values.length > 1) ? values : values[0],
      negate: !ng,
      exists: exists,
      attribute: attribute,
      componentId: componentId,
      zone: zone,
      valueExists: (values.length > 1) ? true : values[0] !== ''
    });
    setZone({...zone});
  };

  const onSaveInList = () => {
    setOpen(false);
    const input = splitValues(listValue);
    setValues(input);
    if (input.length > 1) {
      setFilter({
        operator: 'in_list',
        value: input,
        negate: negate,
        attribute: attribute,
        componentId: componentId,
        zone: zone,
        valueExists: true
      });
    } else {
      setFilter({
        operator: getOperator(operator),
        value: input[0],
        negate: negate,
        attribute: attribute,
        componentId: componentId,
        zone: zone,
        valueExists: input[0] !== ''
      });
    }
    setZone({...zone});
  };

  const inListOnChange = (input: string[]) => {
    if (input.length === 0) {
      setValues(['']);
      setFilter({
        operator: 'in_list',
        value: '', // resets value
        negate: negate,
        attribute: attribute,
        componentId: componentId,
        zone: zone,
        valueExists: false
      });
      setZone({...zone});
    }
  };

  const onOpenInListModal = () => {
    if (!disabled) {
      setOpen(true);
      if (values.length > 1) {
        setListValue(values.join('\r\n'));
      } else {
        setListValue('');
      }
    }
  };

  const splitValues = (input: string) => {
    // splits by new line
    let vals = input.split(/\r?\n/);
    // trims whitespace
    vals = vals.map((v) => v.trim());
    // removes 'falsy' values
    vals = vals.filter(v => v);
    // remove duplicates
    return Array.from(new Set(vals));
  };

  const plusButton = (
    <Button
      variant="success"
      onClick={onSaveInList}
      disabled={splitValues(listValue).length <= 1}
    >
      <FontAwesomeIcon icon={faPlus} size="sm" />
    </Button>
  );

  return (
    <div className={isNum ? 'tol-num-filter' : 'tol-text-filter'} onClick={ stopPropagation }>
      {isNum &&
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
      }
      {type === 'str' && values.length <= 1 &&
        <Button
          className="tol-in-list-button"
          disabled={disabled}
          onClick={onOpenInListModal}
        >
          <FontAwesomeIcon icon={faList} size="sm" />
        </Button>
      }
      {type === 'str' && values.length > 1 ?
        <span className="tol-multi-filter">
          <MultipleSelect
            block
            data={values}
            value={values}
            setValue={inListOnChange}
            placeholder={rename}
            disabled={disabled}
            open={false}
            onClick={onOpenInListModal}
          />
        </span>
        :
        <InputGroup className={disabled ? 'rs-picker-disabled' : ''} disabled={disabled} inside>
          <Input
            onChange={onFilter}
            value={values[0]}
            placeholder={rename}
          />
        </InputGroup>
      }
      <FilterToggle
        negate={negate}
        onNegate={onNegate}
        exists={exists}
        onExists={onExists}
        disabled={disabled}
      />
      <Modal
        size='md'
        open={open}
        setOpen={setOpen}
        actionButton={plusButton}
        overflow={false}
        className='tol-in-list-modal'
      >
        <h5 style={{marginBottom: 12}}>List Filter: {rename}</h5>
        <Input
          as="textarea"
          rows={16}
          placeholder="Add 1 filter value per line..."
          value={listValue}
          onChange={setListValue}
        />
      </Modal>
    </div>
  );
}

export default FilterTextInput;