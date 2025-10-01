/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, forwardRef, useState, useRef } from "react";
import DraggableList from "react-draggable-list";
import {
  Icon,
  SourceTag,
  AttributeTooltip,
  normaliseCaps,
  truncateString,
  IRemoteTarget,
  IAttributeDetails,
  TRANSITION_TIME,
} from "../index";

export interface PSelectedAttributesContainer extends IRemoteTarget {
  attributes: readonly string[];
  setAttributes: (attributes: string[]) => void;
  additionalIcons?: any[];
}

export function SelectedAttributesContainer(props: PSelectedAttributesContainer) {
  const { objectType, dataSource, attributes, setAttributes, additionalIcons } = props;
  const [recentlyMoved, setRecentlyMoved] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [objectAttributes, setObjectAttributes] = useState<IAttributeDetails>(
    {}
  );

  const ref = useRef(null);

  useEffect(() => {
    dataSource.getEntityMeta().then((meta) => {
      setObjectAttributes(meta.flatAttributes[objectType]);
    });
  }, []);

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
    setAttributes(attributes.filter((_, i) => i !== index));
    setDeletingIndex(null);
  };

  const SelectedColumn = forwardRef<
    HTMLDivElement,
    { item: any; dragHandleProps: any }
  >(({ item, dragHandleProps }, ref) => {
    const attributeId = item;
    const attributeDetails = objectAttributes[attributeId] || {};
    const index = attributes.indexOf(attributeId);

    const lettersToDisplay = window.innerWidth < 576 ? 30 : 60;

    return (
      <div
        ref={ref}
        key={`${attributeId}-${index}`}
        className={`tol-config-drawer-selected-column ${
          recentlyMoved === index ? "highlight" : ""
        } ${deletingIndex === index ? "deleting" : ""}`}
      >
        <div>
          <span {...dragHandleProps}>
            <div className={"tol-config-drawer-selected-column-name"}>
              <div style={{ display: "inline", paddingRight: "5px" }}>
                {attributeDetails.display_name || normaliseCaps(attributeId)}
              </div>
              <AttributeTooltip {...props} field={attributeId} />
            </div>
          </span>
          <p className={"tol-config-drawer-selected-column-key"}>
            {truncateString(attributeId, lettersToDisplay)}
          </p>
        </div>
        <div className="tol-config-drawer-btn-array">
          {attributeDetails.source && (
            <SourceTag source={attributeDetails.source} />
          )}
          {additionalIcons?.map(Icon =>
            <Icon attributeId={attributeId} />
          )}
          <div
            className={"tol-active-column-btn"}
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
            className="tol-active-column-btn delete"
            onClick={() => removeAttribute(index)}
          >
            <Icon icon="close" size="lg" />
          </div>
        </div>
      </div>
    );
  });

  return (
    <div>
      <div className="tol-config-drawer-column-container" ref={ref}>
        <DraggableList
          container={() => ref.current}
          itemKey={(item) => item}
          list={attributes}
          // @ts-ignore
          template={(props) => <SelectedColumn {...props} />}
          onMoveEnd={(newList: string[]) => setAttributes(newList)}
          springConfig={{ stiffness: 500, damping: 100 }}
        />
      </div>
      {attributes.length === 0 && (
        <p>
          <i>No active columns. Select columns to display...</i>
        </p>
      )}
    </div>
  );
}
