/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TagPicker } from "rsuite";
import { useEffect, useState } from "react";
import {
  normaliseCaps,
  RELATIONSHIP_PATH_PLACEHOLDER,
  RELATIONSHIP_SEPARATOR,
} from "..";
import type { IRelationshipSelectorChoice, IRemoteTarget, TRelationshipSelectorChoices, TRelationshipValues } from "..";


export interface PRelationshipSelector extends IRemoteTarget {
  /**
   * The relationship path, seperated by '.' (e.g. 'relationship1.relationship2')
   */
  path?: string;
  /**
   * Input placeholder text
   */
  placeholder?: string;
  /**
   * Callback function to handle changes to the relationship path
   */
  onChange?: (value: string) => void;
  /**
   * Class wrapper for the component, allowing for custom styling
   */
  className?: string;
}

export function RelationshipSelector(props: PRelationshipSelector) {
  const {
    dataSource,
    objectType: originalObjectType,
    path,
    placeholder = RELATIONSHIP_PATH_PLACEHOLDER,
  } = props;

  const [values, setValues] = useState<string[]>(path ? path.split(RELATIONSHIP_SEPARATOR) : []);
  const [choices, setChoices] = useState<TRelationshipSelectorChoices>([]);
  const [objectType, setObjectType] = useState<string>();

  const visitedObjectTypes = new Set<string>(choices.map((choice) => choice.targetObjectType));

  useEffect(() => {
    let cancelled = false;

    const resolveObjectType = async () => {
      let currentObjectType = originalObjectType;

      for (const relationship of values) {
        const relationships: TRelationshipValues =
          await dataSource.getMergedRelationshipConfig(currentObjectType);
        const nextObjectType = relationships?.[relationship];
        if (!nextObjectType) break;
        currentObjectType = nextObjectType;
      }

      if (!cancelled) {
        setObjectType(currentObjectType);
      }
    };

    void resolveObjectType();

    return () => {
      cancelled = true;
    };
  }, [dataSource, originalObjectType, values]);

  useEffect(() => {
    if (!objectType) return;
    dataSource.getMergedRelationshipConfig(objectType).then((relationships: TRelationshipValues) => {
      const nextChoices: TRelationshipSelectorChoices = Object.entries(relationships ?? {})
        .map(([relationship, targetObjectType]) => ({
          label: relationship,
          value: relationship,
          targetObjectType,
        }));
      setChoices(nextChoices);
    });
  }, [dataSource, objectType]);

  const onChange = (newValues: string[]) => {
    setValues(newValues);
    if (props.onChange) {
      props.onChange(newValues.join(RELATIONSHIP_SEPARATOR));
    }
  }

  const onSelect = (_: string, choice: IRelationshipSelectorChoice) => {
    // Update objectType based on the selected relationship
    setObjectType(choice.targetObjectType);
  }

  const excludeVisitedChoices = (choices: TRelationshipSelectorChoices) => {
    return choices.filter((choice) => !visitedObjectTypes.has(choice.targetObjectType));
  }

  const renderMenuItem = (label: string, choice: IRelationshipSelectorChoice) => (
    <>
      {normaliseCaps(label)}
      <span className="tol-grey-colour tol-ml-sm">
        {normaliseCaps(choice.targetObjectType)}
      </span>
    </>
  )

  return (
    <TagPicker
      {...props}
      block
      searchable={false}
      data={choices}
      value={values}
      placeholder={placeholder}
      onChange={onChange}
      onSelect={onSelect}
      renderMenuItem={renderMenuItem}
    />
  );
}