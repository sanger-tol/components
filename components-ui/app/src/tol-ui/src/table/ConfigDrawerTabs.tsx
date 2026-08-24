/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { Dispatch, ReactElement, SetStateAction } from "react";
import {
  AttributeSelector,
  SelectedAttributesContainer,
  Tabs,
} from "..";
import type { IFieldMeta, IRemoteTarget } from "..";

interface PConfigDrawerTabs extends IRemoteTarget {
  attributes: string[];
  setAttributes: Dispatch<SetStateAction<string[]>>;
  inactiveAttributes: string[];
  setInactiveAttributes: Dispatch<SetStateAction<string[]>>;
  additionalIcons: Array<({ attributeId }: { attributeId: string }) => ReactElement>;
  fieldMeta: IFieldMeta;
  allAttributeKeys?: string[];
  customAttributeSelection?: string[];
}

export function ConfigDrawerTabs(props: PConfigDrawerTabs) {
  const {
    attributes,
    setAttributes,
    inactiveAttributes,
    setInactiveAttributes,
    additionalIcons,
    fieldMeta,
    allAttributeKeys,
    customAttributeSelection,
  } = props;

  return (
    <Tabs defaultActiveKey="active">
      <Tabs.Tab eventKey="active" title="Active Columns">
        <div className="tol-section-spacing-top">
          <AttributeSelector
            {...props}
            sticky
            recommendedFilterAvailable
            renderSearchBySource
            placeholder="Select columns to display..."
            attribute={attributes}
            setAttributes={(nextActive) => {
              setAttributes(nextActive);
              setInactiveAttributes((prevInactive) =>
                prevInactive.filter((col) => !nextActive.includes(col)),
              );
            }}
            disabledValues={null}
            numPopulatedFields={0}
            populatedFieldType={"column"}
            additionalPopulatedFieldData={"."}
            customAttributeSelection={allAttributeKeys ?? customAttributeSelection}
          />
          <SelectedAttributesContainer
            {...props}
            attributes={attributes}
            setAttributes={setAttributes}
            additionalIcons={additionalIcons}
            fieldMeta={fieldMeta}
          />
        </div>
      </Tabs.Tab>
      <Tabs.Tab eventKey="inactive" title="Inactive Columns">
        <div className="tol-section-spacing-top">
          <AttributeSelector
            {...props}
            sticky
            recommendedFilterAvailable
            renderSearchBySource
            placeholder="Select columns to make them visible for users..."
            attribute={inactiveAttributes}
            setAttributes={setInactiveAttributes}
            disabledValues={attributes.length > 0 ? Object.fromEntries(attributes.map(attr => [attr, true])) : undefined}
            numPopulatedFields={0}
            populatedFieldType={"column"}
            additionalPopulatedFieldData={"."}
            customAttributeSelection={allAttributeKeys}
          />
          <SelectedAttributesContainer
            {...props}
            attributes={inactiveAttributes}
            setAttributes={setInactiveAttributes}
            additionalIcons={additionalIcons}
            fieldMeta={fieldMeta}
            emptyMessage="No inactive columns. Select columns to make them visible for users to add them to their tables."
          />
        </div>
      </Tabs.Tab>
    </Tabs>
  );
}
