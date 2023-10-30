/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState, useEffect } from 'react';
import  { GlobalMultipleSelect, Status } from '../index'
import { httpClient } from '../services/http/httpClient';
import { Col, Row } from 'react-bootstrap';
import Placeholder from "../general/Placeholder";


interface Props {
  endpoint: string,
  fields: string[],
  renamedFields?: object,
  globalFilters: object,
  dependentFilters?: boolean,
  setGlobalFilters: React.Dispatch<React.SetStateAction<object>>,
  baseUrl?: string
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

function OrderData(data, fields: string[]){
  const ordered_data: FilterObject[] = []
  fields.map((field) => {
    for (let i=0; i<data.length; i++){
      if (field == data[i].name){
        ordered_data.push(data[i])
      }
    }
  })
  return ordered_data
}

// Stops the filters filtering themselves
function ConfigFilters(index: number, filtersList, globalFilters){
  const returnObj = {in_list: {}}
  const valuesToRemove: string[] = []
  let indexBefore = 0
  if (index>0){indexBefore = index-1}
  // Line below checks if there is any filters set and also if this specific field has the above filter set already
  if (globalFilters.in_list && globalFilters.in_list[filtersList[indexBefore]]){
    const slicedFilters = filtersList.slice(0,[index])
    slicedFilters.forEach((filter) => {
      if (globalFilters.in_list[filter]){
        let filtersToApply = globalFilters.in_list[filter]
        // Prevents filters being added to every field
        for (const f in valuesToRemove){
          if (filtersToApply.includes(valuesToRemove[f])){
            const indexOfRemoval = filtersToApply.indexOf(valuesToRemove[f])
            filtersToApply.splice(indexOfRemoval,1)
          }
        }
        returnObj.in_list[filter] = filtersToApply
        valuesToRemove.push(...globalFilters.in_list[filter])
      }
    })
    return returnObj
  } else {
    return returnObj
  }
}

function ApplyFilteredOptions(data: FilterObject[], fieldName: string){
  let fieldItem: FilterObject = {name:"", choices:[]}
  data.forEach((field) => {
    if (field.name == fieldName){
      fieldItem = field
    }
  })
  return fieldItem
}

function RemoteMultipleSelectFilters(props: Props) {
  const [dataToPass, setDataToPass] = useState<FilterObject[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState(true)
  const {endpoint, fields, renamedFields, globalFilters,
         setGlobalFilters, baseUrl, dependentFilters} = props

  useEffect(() => {
    setGlobalFilters({in_list: {}})
    fetchData()
  }, [])

  useEffect(() => {
    fetchData()
  }, [globalFilters])

  const aggs = FormattingFieldsToAggregations(fields)

  const fetchData = () => {
    if (!dependentFilters){
      httpClient().post('/' + endpoint + ':aggregations', aggs, {
        baseURL: baseUrl
      })
        .then((res: any) => {
          const data = (
            FormattingAggregationsToFilters(res.data.meta.aggregations)
          )
          const ordered_data = OrderData(data, fields)
          setDataToPass(ordered_data)
          setLoading(false)
        })
        .catch((error: any) => {
          setErrorMessage(error.message)
          console.error(error.message)
        })
    } else {
      const dataToOrder: FilterObject[] = [];
      fields.map((field, index) => {
        const filter = ConfigFilters(index, fields, globalFilters)
        console.log(filter)
        httpClient().post('/' + endpoint + ':aggregations', aggs, {
          baseURL: baseUrl,
          params: {
            filter: filter
          }
        })
          .then((res: any) => {
            const data = (
              FormattingAggregationsToFilters(res.data.meta.aggregations)
            )
            const filterItem = ApplyFilteredOptions(data, field)
            dataToOrder.push(filterItem)
            const ordered_data = OrderData(dataToOrder, fields)
            setDataToPass(ordered_data)
          })
          .catch((error: any) => {
            setErrorMessage(error.message)
            console.error(error.message)
          })
      })
      setLoading(false)
    }
  }

  if (errorMessage !== '') {
    return (
      <div className='global-filters'>
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
      </div>
    )
  }

  if (loading) {
    return (
      <div className='global-filters'>
        <Row>
          {fields.map((field) => {
            return (
              <Col key={`${field}-filter-placeholder`}>
                <Placeholder height={37}/>
              </Col>
            )
          })}
        </Row>
      </div>
    )
  }

  return (
    <div className='global-filters'>
      <Row>
        {dataToPass.map((filter) => {
          return (
            <Col key={filter.name}>
              <GlobalMultipleSelect
                block
                name={filter.name}
                display_name={(renamedFields && renamedFields[filter.name]) || filter.name}
                data={filter.choices}
                // @ts-ignore
                globalFilters={globalFilters}
                setGlobalFilters={setGlobalFilters}
              />
            </Col>
          )
        })}
      </Row>
    </div>
  )
}
  
export default RemoteMultipleSelectFilters;
