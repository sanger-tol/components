/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, forwardRef, useState, useRef } from "react";
import DraggableList from "react-draggable-list";
import {
  Icon,
  SourceTag,
  truncateString,
  IRemoteTarget,
  IAttributeDetails,
  TRANSITION_TIME,
  AttributeTitle,
  IFieldMeta
} from "../index";

export interface PSelectedAttributesContainer extends IRemoteTarget {
  attributes: readonly string[];
  setAttributes: (attributes: string[]) => void;
  additionalIcons?: any[];
  fieldMeta?: IFieldMeta; // temporary addition for table renames
}

export function SelectedAttributesContainer(props: PSelectedAttributesContainer) {
  const { objectType, dataSource, attributes, setAttributes, additionalIcons, fieldMeta } = props;
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
            <div className="tol-config-drawer-selected-column-name">
              <AttributeTitle
                objectType={objectType}
                dataSource={dataSource}
                attributeId={attributeId}
                className="tol-config-drawer-selected-column-title"
                rename={fieldMeta?.[attributeId]?.rename}
              />
            </div>
          </span>
          <p className="tol-config-drawer-selected-column-key">
            {truncateString(attributeId, lettersToDisplay)}
          </p>
        </div>
        <div className="tol-config-drawer-btn-array">
          {attributeDetails.source && (
            <SourceTag source={attributeDetails.source} />
          )}
          {additionalIcons?.map(Icon =>
            <Icon attributeId={attributeId} key={attributeId}/>
          )}
          <div
            className={"tol-active-column-btn"}
            onClick={() => moveAttributeUp(index)}
          >
            <Icon icon="arrow-up" />
          </div>
          <div
            className={"tol-active-column-btn"}
            onClick={() => moveAttributeDown(index)}
          >
            <Icon icon="arrow-down" />
          </div>
          <div
            className="tol-active-column-btn delete"
            onClick={() => removeAttribute(index)}
          >
            <Icon icon="close" />
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
      {(attributes.length === 0 && fieldMeta) && (
        <p>
          <i>No active columns. Select columns to display...</i>
        </p>
      )}
    </div>
  );
}
