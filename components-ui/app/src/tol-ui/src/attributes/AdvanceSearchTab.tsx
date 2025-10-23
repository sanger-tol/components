/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  IRemoteTarget,
  Tabs,
  AutoComplete,
  IAttributeDescriptor,
  Button,
} from "..";

export interface PAdvanceSearchTab extends IRemoteTarget {
  MenuItem: React.ReactNode;
  setAttributes: React.SetStateAction<any>;
  setReadOnly?: (readOnly: boolean) => void;
}

export function AdvanceSearchTab(props: PAdvanceSearchTab) {
  const { MenuItem, objectType, dataSource, setAttributes } = props;
  const [searchValue, setSearchValue] = useState<string>("");
  const [attributeAvailable, setAttributeAvailable] = useState<boolean>(false);

  const handleOnChange = async (value: string) => {
    setSearchValue(value);
    if (value.slice(-1) === ".") {
      console.log('There is a relationship!')
      // Check for other relationships and set a limit of hops?

    } else {
      setAttributeAvailable(false);
      await dataSource.getAttributeDescriptor({ objectType: objectType, field: value }).then((data: IAttributeDescriptor | undefined) => {
        if (data !== undefined) {
          setAttributeAvailable(true);
        }
      })
    }
  }

  const updateAttributes = (attribute: string, attributes: string[]) => {
    if (attributes.includes(attribute)) {
      return attributes;
    } else {
      return [...attributes, attribute];
    }
  }

  const handleOnAdd = () => {
    setAttributes((prev: string[]) => updateAttributes(searchValue, prev));
  }

  return (
    <Tabs defaultActiveKey="all">
      <Tabs.Tab eventKey="all" title="All">
        {MenuItem}
      </Tabs.Tab>
      <Tabs.Tab eventKey="advanced" title="Advanced">
        <AutoComplete
          label="Search attributes..."
          data={[]}
          value={searchValue}
          onChange={handleOnChange}
          loading={false}
        />
        {/* Also need to add a pop up that lets them know the field was added */}
        <Button
          onClick={handleOnAdd}
          disabled={!attributeAvailable}
          disabledTooltip="Attribute not found"
          icon="plus"
          type="success"
        />
      </Tabs.Tab>
    </Tabs>
  );
}
