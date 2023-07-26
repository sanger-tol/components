/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState, useEffect } from 'react';
import  { GlobalMultipleSelect, Status } from '../index'
import { httpClient } from '../services/http/httpClient';
import { Container, Col, Row } from 'react-bootstrap';
import { Placeholder } from 'rsuite';


interface Props {
  endpoint: string,
  fields: string[],
  globalFilters: object,
  setGlobalFilters: React.Dispatch<React.SetStateAction<object>>
}

interface FilterObject {
  name: string,
  choices: string[]
}

function FormattingFieldsToAggregations(fields: any) {
  const aggregation = {aggs:{}}
  fields.map((field: any) => {
      aggregation.aggs[field] = {
        "terms" : { "field" : `${field}.keyword`,  "size" : 99999 }
      }
  })
  return aggregation
}

function FormattingAggregationsToFilters(aggregation: any) {
  const filterData: FilterObject[] = [];

  for (const field in aggregation) {
    const filterObject = {} as FilterObject
    filterObject.name = field
    filterObject.choices = []
    aggregation[field].buckets.forEach((bucket: any) => {
      filterObject.choices.push(bucket.key)
    });
    filterData.push(filterObject)
  }
  return filterData
}

function RemoteMultipleSelectFilters(props: Props) {
  const [dataToPass, setDataToPass] = useState<FilterObject[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState(true)
  const {endpoint, fields, globalFilters, setGlobalFilters} = props

  useEffect(() => {
    fetchData()
    setGlobalFilters({in_list:  {}})
  }, [])

  const aggs = FormattingFieldsToAggregations(fields)

  const fetchData = () => {
    httpClient().post('/' + endpoint + ':aggregations', aggs, {})
      .then((res: any) => {
        setDataToPass(
          FormattingAggregationsToFilters(res.data.meta.aggregations)
        )
        setLoading(false)
      })
      .catch((error: any) => {
        setErrorMessage(error.message)
      })
  }

  if (errorMessage !== '') {
    return (
      <Container className='global-filters'>
        <Row>
          {fields.map((field) => {
            return (
              <Col key={`${field}-filter-placeholder`}>
                <Status
                  status="danger"
                  text={errorMessage}
                />
              </Col>
            )
          })}
        </Row>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container className='global-filters'>
        <Row>
          {fields.map((field) => {
            return (
              <Col key={`${field}-filter-placeholder`}>
                <div className='tol-input-placeholder'>
                  <Placeholder.Graph active/>
                </div>
              </Col>
            )
          })}
        </Row>
      </Container>
    )
  }

  return (
    <Container className='global-filters'>
      <Row>
        {dataToPass.map((filter) => {
          return (
            <Col key={filter.name}>
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
  )
}
  
export default RemoteMultipleSelectFilters;
