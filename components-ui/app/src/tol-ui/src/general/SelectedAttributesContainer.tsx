/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  Icon,
  SourceTag,
  EntityMetaToolTip,
  TsDataSource
} from "../index";
import { normaliseCaps } from "../general/utils";
import Draggable from "react-draggable";
import DraggableList from "react-draggable-list";

const TRANSITION_TIME: number = 300;

interface AttributeDetails {
  source?: string;
  rename?: string;
}

export interface Props {
  baseUrl?: string;
  endpoint: string;
  attributes: string[];
  setAttributes: (attributes: string[]) => void;
  title?: string;
}

function SelectedAttributesContainer(props: Props) {
  const {
    baseUrl,
    endpoint,
    attributes,
    setAttributes,
    title = "Active Columns:",
  } = props;
  const [recentlyMoved, setRecentlyMoved] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [objectAttributes, setObjectAttributes] = useState<AttributeDetails>({});

  useEffect(() => {
    const ds = new TsDataSource({ baseUrl: baseUrl });
    ds.getEntityMeta().then((meta) => {
      setObjectAttributes(meta.flatAttributes[endpoint]);
    });
  }, [])

  const moveAttributeUp = (index: number) => {
    if (index === 0) return;
    const newAttributes = [...attributes];
    [newAttributes[index - 1], newAttributes[index]] = [
      newAttributes[index],
      newAttributes[index - 1],
    ];
    setAttributes(newAttributes);
    setRecentlyMoved(index - 1);
    setTimeout(() => setRecentlyMoved(null), TRANSITION_TIME);
  };

  const moveAttributeDown = (index: number) => {
    if (index === attributes.length - 1) return;
    const newAttributes = [...attributes];
    [newAttributes[index + 1], newAttributes[index]] = [
      newAttributes[index],
      newAttributes[index + 1],
    ];
    setAttributes(newAttributes);
    setRecentlyMoved(index + 1);
    setTimeout(() => setRecentlyMoved(null), TRANSITION_TIME);
  };

  const removeAttribute = (index: number) => {
    setDeletingIndex(index);
    setTimeout(() => {
      setAttributes(attributes.filter((_, i) => i !== index));
      setDeletingIndex(null);
    }, TRANSITION_TIME);
  };

  const selectedColumn = ({ item, itemSelected, dragHandleProps }, index: number) => {
    const { onMouseDown, onTouchStart } = dragHandleProps;
    const attr_name = item
    const attributeDeatils = objectAttributes[attr_name] || {};

    return (
        <div
        key={`${attr_name}-${index}`}
        className={`tol-config-drawer-selected-column ${recentlyMoved === index ? "highlight" : ""
          } ${deletingIndex === index ? "deleting" : ""}`}
      >
        <div>
          <span
            onTouchStart={onTouchStart}
            onMouseDown={onMouseDown}
          >
            <div className={"tol-config-drawer-selected-column-name"}>
              <div style={{ display: 'inline', paddingRight: '5px' }}>{attributeDeatils.display_name || normaliseCaps(attr_name)}</div>
              <EntityMetaToolTip baseUrl={baseUrl} endpoint={endpoint} field={attr_name} />
            </div>
          </span>
          <p className={"tol-config-drawer-selected-column-key"}>{attr_name}</p>
        </div>
        <div className="tol-config-drawer-btn-array">
          {attributeDeatils.source && <SourceTag source={attributeDeatils.source} />}
          <div
            className={"tol-active-column-btn first"}
            onClick={() => moveAttributeUp(index)}
          >
            <Icon icon="arrow-up" size="lg" />
          </div>
          <div
            className={"tol-active-column-btn"}
            onClick={() => moveAttributeDown(index)}
          >
            <Icon icon="arrow-down" size="lg" />
          </div>
          <div
            className="tol-active-column-btn"
            onClick={() => removeAttribute(index)}
          >
            <Icon icon="close" size="lg" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div>
        <h6 className="tol-config-drawer-column-title">{title}</h6>
        <div className={"tol-config-drawer-column-container"}>
          <DraggableList itemKey="key" list={attributes} template={selectedColumn} onMoveEnd={(newList) => (setAttributes(newList))}/>
          {/* {attributes.map((att, index) => (
            <div
              key={`${att}-${index}`}
              className="tol-config-drawer-column-contents"
            >
              {selectedColumn(att, index)}
            </div>
          ))} */}
        </div>
        {attributes.length === 0 && (
          <p>
            <i>No active columns. Select columns to display...</i>
          </p>
        )}
      </div>
    </div>
  );


}

export default SelectedAttributesContainer;
