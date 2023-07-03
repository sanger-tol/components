/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/


import React, { useState, useEffect } from 'react';
import  { GlobalMultipleSelect, Status } from '../index'
import { httpClient } from '../services/http/httpClient';
import { Container, Col, Row } from 'react-bootstrap';


interface Props {
  endpoint: string
  fields: string[]
  globalFilters: object
  setGlobalFilters:React.Dispatch<React.SetStateAction<object>>
}

interface FilterObject {
  name: string
  choices: string[]
}

function FormattingFieldsToAggregations(fields){
  const aggregation = {aggs:{}}
  fields.map((field) => {
      aggregation.aggs[field] = {
        "terms" : { "field" : `${field}.keyword`,  "size" : 99999 }
      }
  })
  return aggregation
}

function FormattingAggregationsToFilters(aggregation){
  const filterData: FilterObject[] = [];
  for (const field in aggregation){
    const filterObject = {} as FilterObject
    filterObject.name = field
    filterObject.choices = []
    aggregation[field].buckets.forEach((bucket) => {
        filterObject.choices.push(bucket.key)
    });

    filterData.push(filterObject)
  }
  return filterData
}

function RemoteMultipleSelectFilters(props: Props) {
  const [dataToPass, setDataToPass] = useState<FilterObject[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const {endpoint, fields, globalFilters, setGlobalFilters} = props

  useEffect(() => {
    fetchData()
    setGlobalFilters({in_list:{}})
  }, [])

  const aggs = FormattingFieldsToAggregations(fields)


  const fetchData = () => {
    httpClient().post('/' + endpoint + ':aggregations', aggs, {})
      .then((res: any) => {
        setDataToPass(FormattingAggregationsToFilters(res.data.meta.aggregations))
      })
      .catch((error: any) => {
        setErrorMessage(error.message)
      })
    }

  if( errorMessage === ''){
    return (
      <Container className='global-filters'>
        <Row>
        {dataToPass.map((filter) => {
          return (
            <Col>
              <GlobalMultipleSelect
                block
                name={filter.name}
                data={filter.choices}
                // @ts-ignore
                globalFilters={globalFilters}
                setGlobalFilters={setGlobalFilters}
              />
            </Col>
          )
        })}
        </Row>
      </Container>
    );
  }else{
    return (
      <Container className='global-filters'>
        <Row>
        {dataToPass.map((filter) => {
          return (
            <Col>
            <GlobalMultipleSelect
              block
              name={filter.name}
              data={[]}
              // @ts-ignore
              globalFilters={globalFilters}
              setGlobalFilters={setGlobalFilters}
            />
            </Col>
          )
        })}
        </Row>
        <Row>
          <Status
            status='red'
            text={errorMessage}
          />
        </Row>
      </Container>
    )
  }
}
  
  export default RemoteMultipleSelectFilters;
