/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { SelectPicker } from "rsuite";

import type { TLabelAndValueData } from "..";

export interface PSingleSelect {
  /**
   * The options to display in the dropdown
   */
  data: string[] | TLabelAndValueData;
  /**
   * The text to display when no option has been chosen
   */
  placeholder?: string;
  /**
   * The option currently selected
   */
  value: string;
  /**
   * Runs when the user selects an option, giving its value
   */
  onChange: (value: string) => void;
  /**
   * Whether to display this component as a block (fill the width)
   */
  block?: boolean;
  /**
   * Whether to disable this component
   */
  disabled?: boolean;
  /**
   * Whether the component is in a loading state
   * (and so shouldn't be interacted with yet)
   */
  loading?: boolean;
  /**
   * Additional CSS class name(s)
   */
  className?: string;
  /**
   * Test ID to use for Playwright tests
   */
  testid?: string;
  /**
   * The default option to be selected
   */
  defaultValue?: string;
  /**
   * Whether to show the 'x' button that clears the selection option
   * such that nothing is selected
   */
  cleanable?: boolean;
  /**
   * Whether to display the search bar
   */
  searchable?: boolean;
}

export const SingleSelect = (props: PSingleSelect) => {
  const { testid } = props;
  const [data, setData] = useState([{}]);

  useEffect(() => {
    if (typeof props.data[0] === "string") {
      setData(props.data.map((item) => ({ label: item, value: item })));
    } else {
      setData(props.data);
    }
  }, [props.data]);

  return (
    <SelectPicker
      {...props}
      data={data}
      data-testid={testid}
    />
  );
};
