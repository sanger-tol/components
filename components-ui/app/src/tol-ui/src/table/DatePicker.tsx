/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { DateRangePicker } from 'rsuite';
import { stopPropagation } from '../general/Utils';


export interface Props {
  column: object,
  onFilter: (value: string) => void,
}

export interface State {
  value: any
}

class DatePicker extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      value: []
    };
    this.filter = this.filter.bind(this);
  }

  filter = (value: any) => {
    this.setState({ value: value });
    this.props.onFilter(value);
  };
  
  render() {
    return (
      <span onClick={ stopPropagation } className="filter-input-hide" id="tol-filter-input">
        <DateRangePicker
          block
          onChange={ this.filter }
          value={ this.state.value }
          format="dd/MM/yyyy"
          placeholder="Select Date Range"
        />
      </span>
    );
  }
}

export default DatePicker;
