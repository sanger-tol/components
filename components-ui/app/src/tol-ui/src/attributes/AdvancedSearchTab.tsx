/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import {
  AutoComplete,
  Button,
  BUTTONS,
  IconTooltip,
  PopUpMessage,
  stopPropagation
} from "..";
import type { IAttributeDescriptor, IRemoteTarget } from "..";

export interface PAdvancedSearchTab extends IRemoteTarget {
  /** State setter for the list of attributes selected */
  setAttributes: Dispatch<SetStateAction<string[]>>;
}

export function AdvancedSearchTab(props: PAdvancedSearchTab) {
  const { objectType, dataSource, setAttributes } = props;

  const [searchValue, setSearchValue] = useState<string>("");
  const [isAttributeAvailable, setIsAttributeAvailable] = useState<boolean>(false);
  // const [availableRelationships, setAvailableRelationships] = useState<string[] | undefined>(undefined);

  const handleOnChange = async (value: string) => {
    setSearchValue(value);
    if (value.slice(-1) === ".") {
      // TODO Uncomment when availableRelationships functionality is needed on the dropdown

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
      setIsAttributeAvailable(false);
      await dataSource.getAttributeDescriptor({ objectType: objectType, field: value }).then((data: IAttributeDescriptor | undefined) => {
        if (data !== undefined) {
          setIsAttributeAvailable(true);
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
    <div className="tol-attribute-selector-advanced-search-tab" onKeyDown={stopPropagation}>
      <AutoComplete
        label=""
        // Add available relationships state in data
        data={[]}
        value={searchValue}
        onChange={handleOnChange}
        loading={false}
      />
      <span
        className="tol-attribute-selector-advanced-search-tab__search"
      >
        <div className="tol-attribute-selector-advanced-search-tab__tooltip">
          <IconTooltip
            contents="Add columns using system names, with relationships separated by periods.
          E.g. 'relationship1.relationship2.attribute_name'"
          />
        </div>
        <div className="tol-attribute-selector-advanced-search-tab__button-wrapper">
          <Button
            {...BUTTONS.ADD}
            onClick={handleOnAdd}
            disabled={!isAttributeAvailable}
            disabledTooltip="Attribute not found"
          />
        </div>
      </span>
    </div>
  );
}
