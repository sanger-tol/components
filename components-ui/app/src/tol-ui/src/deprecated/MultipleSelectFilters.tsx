/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from 'react';
import { MultipleSelect } from '../index';
import { Col, Row } from 'react-bootstrap';

interface Props {
  filters: Filters[]
  value: object
  setValue: any
}

interface Filters {
    name: string
    choices: string[]
    selected: string[]
    setChoices: any
}

function MultipleSelectFilters(props: Props) {
  const {filters, setValue} = props;

  useEffect(() => {
    const formatted_data = formatData();
    setValue(formatted_data);
  }, filters.map((filter) => filter.selected));

  const formatData =  () => {
    const return_obj = {};
    filters.map((filter) => {
      const filter_name = filter.name;
      return_obj[filter_name] = filter.selected;
    });
    return {"in_list": return_obj};
  };

  return (
    <div className='global-filters'>
      <Row>
        {filters.map((filter, index) => {
          return (
            <Col key={`tol-multiple-select-${index}`}>
              <MultipleSelect
                block
                data={filter.choices} 
                placeholder={filter.name} 
                value={filter.selected}
                setValue={filter.setChoices}    
              />
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
  
export default MultipleSelectFilters;
