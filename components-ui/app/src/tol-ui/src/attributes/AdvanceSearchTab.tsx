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
  PopUpMessage,
  IconTooltip,
  stopPropagation,
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
  // const [availableRelationships, setAvailableRelationships] = useState<string[] | undefined>(undefined);

  const handleOnChange = async (value: string) => {
    setSearchValue(value);
    if (value.slice(-1) === ".") {
      // Uncomment when availableRelationships functionality is needed on the dropdown

      // await dataSource.getAvailableRelationships(objectType, value.slice(0, -1)).then((data: string[] | undefined) => {
      //   if (data) {
      //     const updatedOptions = data.map((relationship) => {
      //       return value + relationship;
      //     })
      //     setAvailableRelationships(updatedOptions);
      //   } else {
      //     setAvailableRelationships(undefined);
      //   }
      // });

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
      PopUpMessage({
        type: "warning",
        message: `The attribute "${searchValue}" has already been added.`,
      })
      return attributes;
    } else {
      PopUpMessage({
        type: "success",
        message: `The attribute "${searchValue}" has been added.`,
      })
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
        <div className="tol-advance-search-tab">
          <span
            className="tol-advance-search-tab-search"
            onKeyDown={stopPropagation}
          >
            <div className="tol-advance-search-tab-tooltip">
              <IconTooltip
                contents="Add columns using system names, with relationships separated by periods.
                E.g. 'relationship1.relationship2.attribute_name'"
              />
            </div>
            <div className="tol-advance-search-tab-input">
              <AutoComplete
                label=""
                // Add available relationships state in data
                data={[]}
                value={searchValue}
                onChange={handleOnChange}
                loading={false}
              />
            </div>
          </span>
          <Button
            onClick={handleOnAdd}
            className="tol-advance-search-tab-button"
            disabled={!attributeAvailable}
            disabledTooltip="Attribute not found"
            icon="plus"
            type="success"
            position="right"
          />
        </div>
      </Tabs.Tab>
    </Tabs>
  );
}
