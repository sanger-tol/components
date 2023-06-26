/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useEffect } from 'react';
import  { MultipleSelect } from '../index'
import { Container, Col, Row } from 'react-bootstrap';

interface Props {
    filters: Filters[]
    value: object
    setValue: React.Dispatch<React.SetStateAction<object>>
}

interface Filters {
    name: string
    choices: string[]
    selected: string[]
    setChoices: React.Dispatch<React.SetStateAction<string[]>>
}

function MultipleSelectFilters(props: Props) {
    const {filters, setValue} = props

    useEffect(() => {
        const formatted_data = formatData()
        setValue(formatted_data);
      }, filters.map((filter) => filter.selected));

      const formatData =  () => {
        const return_obj = {}
        filters.map((filter) => {
            const filter_name = filter.name
            return_obj[filter_name] = filter.selected
        })
        return {"in_list": return_obj}
      }

    return (
        <Container className='global-filters'>
            <Row>
            {filters.map((filter) => {
                return (
                    <Col>
                    <MultipleSelect
                        block
                        data={filter.choices} 
                        placeholder={filter.name} 
                        value={filter.selected}
                        setValue={filter.setChoices}    
                    />
                    </Col>
                )
            })}
            </Row>
        </Container>
    );
  }
  
  export default MultipleSelectFilters;
