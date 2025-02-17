/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { GlobalMultipleSelect, StatusMessage } from "../index";
import { httpClient } from "../services/http/httpClient";
import { Col, Row } from "react-bootstrap";
import Placeholder from "../general/Placeholder";

interface FilterObject {
  name: string;
  choices: string[];
}

function FormattingFieldsToAggregations(fields: any) {
  const aggregation = { aggs: {} };
  fields.map((field: any) => {
    aggregation.aggs[field] = {
      terms: { field: `${field}.keyword`, size: 99999 },
    };
  });
  return aggregation;
}

function FormattingAggregationsToFilters(aggregation: any) {
  const filterData: FilterObject[] = [];

  for (const field in aggregation) {
    const filterObject = {} as FilterObject;
    filterObject.name = field;
    filterObject.choices = [];
    aggregation[field].buckets.forEach((bucket: any) => {
      filterObject.choices.push(bucket.key);
    });
    filterData.push(filterObject);
  }
  return filterData;
}

function orderData(data: any, fields: string[]) {
  const orderedData: FilterObject[] = [];
  fields.map((field) => {
    for (let i = 0; i < data.length; i++) {
      if (field === data[i].name) {
        orderedData.push(data[i]);
      }
    }
  });
  return orderedData;
}

function configFilters(index: number, filtersList: any, globalFilters: any) {
  const updatedFilters = { in_list: {} };
  if (globalFilters.in_list) {
    const filtersToApply = filtersList.slice(0, [index]);
    filtersToApply.forEach((filter: any) => {
      if (globalFilters.in_list[filter]) {
        updatedFilters.in_list[filter] = globalFilters.in_list[filter];
      }
    });
  }
  return updatedFilters;
}

function applyFilteredOptions(data: FilterObject[], fieldName: string) {
  let fieldItem: FilterObject = {
    name: "",
    choices: [],
  };
  data.forEach((field) => {
    if (field.name === fieldName) {
      fieldItem = field;
    }
  });
  return fieldItem;
}

interface Props {
  endpoint: string;
  fields: string[];
  renamedFields?: object;
  globalFilters: object;
  dependentFilters?: boolean;
  setGlobalFilters: any;
  baseUrl?: string;
}

function RemoteMultipleSelectFilters(props: Props) {
  const [dataToPass, setDataToPass] = useState<FilterObject[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const {
    endpoint,
    fields,
    renamedFields,
    globalFilters,
    setGlobalFilters,
    baseUrl,
    dependentFilters,
  } = props;

  useEffect(() => {
    fetchData();
  }, [globalFilters]);

  const aggs = FormattingFieldsToAggregations(fields);

  const fetchData = () => {
    if (!dependentFilters) {
      httpClient()
        .post("/" + endpoint + ":aggregations", aggs, {
          baseURL: baseUrl,
        })
        .then((res: any) => {
          const data = FormattingAggregationsToFilters(
            res.data.meta.aggregations,
          );
          const orderedData = orderData(data, fields);
          setDataToPass(orderedData);
          setLoading(false);
        })
        .catch((error: any) => {
          setErrorMessage(error.message);
          console.error(error.message);
        });
    } else {
      const dataToOrder: FilterObject[] = [];
      fields.map((field, index) => {
        const filter = configFilters(index, fields, globalFilters);
        httpClient()
          .post("/" + endpoint + ":aggregations", aggs, {
            baseURL: baseUrl,
            params: {
              filter: filter,
            },
          })
          .then((res: any) => {
            const data = FormattingAggregationsToFilters(
              res.data.meta.aggregations,
            );
            const filterItem = applyFilteredOptions(data, field);
            dataToOrder.push(filterItem);
            const ordered_data = orderData(dataToOrder, fields);
            setDataToPass(ordered_data);
          })
          .catch((error: any) => {
            setErrorMessage(error.message);
            console.error(error.message);
          });
      });
      setLoading(false);
    }
  };

  if (errorMessage !== "") {
    return (
      <div className="global-filters">
        <Row>
          {fields.map((field) => {
            return (
              <Col key={`${field}-filter-placeholder`}>
                <StatusMessage status="error" message={errorMessage} />
              </Col>
            );
          })}
        </Row>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="global-filters">
        <Row>
          {fields.map((field) => {
            return (
              <Col key={`${field}-filter-placeholder`}>
                <Placeholder height={37} />
              </Col>
            );
          })}
        </Row>
      </div>
    );
  }

  return (
    <div className="global-filters">
      <Row>
        {dataToPass.map((filter) => {
          return (
            <Col key={filter.name}>
              <GlobalMultipleSelect
                block
                name={filter.name}
                display_name={
                  (renamedFields && renamedFields[filter.name]) || filter.name
                }
                data={filter.choices}
                // @ts-ignore
                globalFilters={globalFilters}
                setGlobalFilters={setGlobalFilters}
              />
            </Col>
          );
        })}
      </Row>
    </div>
  );
}

export default RemoteMultipleSelectFilters;
