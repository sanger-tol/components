/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { SelectPicker } from "rsuite";
import { Dispatch, useEffect, useRef, useState } from "react";
import {
  normaliseCaps,
  RELATIONSHIP_PATH_PLACEHOLDER,
  RELATIONSHIP_SEPARATOR,
  sortObjectAlphabetically,
} from "..";
import type { IRelationshipSelectorChoice, IRemoteTarget, TRelationshipSelectorChoices } from "..";


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
  /**
   * Optional target object type. If set, a relationship option is highlighted when
   * selecting it would complete the translation path to this object type.
   */
  targetObjectType?: string;
  /**
   * Optional externally controlled path completion value.
   * If provided, this value is used instead of the selector's internal completion state.
   */
  pathComplete?: boolean;
  /**
   * Optional callback to expose path completion changes to parent components.
   */
  setPathComplete?: Dispatch<React.SetStateAction<boolean>>;
}

/**
 * TODO: Ensure this is complete and is stress-tested before use (future).
 * Builds a relationship path using a dropdown of choices for the next section of the path
 */
export function RelationshipSelector(props: PRelationshipSelector) {
  const {
    className,
    dataSource,
    objectType: originalObjectType,
    onChange,
    path,
    placeholder = RELATIONSHIP_PATH_PLACEHOLDER,
    targetObjectType,
    pathComplete,
    setPathComplete,
  } = props;

  const [values, setValues] = useState<string[]>(path ? path.split(RELATIONSHIP_SEPARATOR) : []);
  const [choices, setChoices] = useState<TRelationshipSelectorChoices>([]);
  const [currentPathObjectType, setCurrentPathObjectType] = useState<string>(originalObjectType);
  const [open, setOpen] = useState(false);
  const closeFromSelectionRef = useRef<boolean | null>(null);

  useEffect(() => {
    setValues(path ? path.split(RELATIONSHIP_SEPARATOR).filter(Boolean) : []);
  }, [path]);

  // Getting the current set of relationship choices
  useEffect(() => {
    let cancelled = false;

    const buildChoices = async () => {
      const nextValues = path ? path.split(RELATIONSHIP_SEPARATOR).filter(Boolean) : [];
      let currentObjectType = originalObjectType;
      const visitedObjectTypes = [originalObjectType];

      for (const relationship of nextValues) {
        const relationships = await dataSource.getMergedRelationshipConfig(currentObjectType);
        const targetObjectType = relationships?.[relationship];

        if (!targetObjectType) break;

        currentObjectType = targetObjectType;
        visitedObjectTypes.push(targetObjectType);
      }

      const relationships = await dataSource.getMergedRelationshipConfig(currentObjectType);
      const nextChoices: TRelationshipSelectorChoices = Object.entries(
        sortObjectAlphabetically(relationships ?? {})
      )
        .filter(([, targetObjectType]) => !visitedObjectTypes.includes(targetObjectType))
        .map(([relationship, targetObjectType]) => ({
          label: relationship,
          value: relationship,
          targetObjectType,
        }));

      if (!cancelled) {
        setChoices(nextChoices);
        setCurrentPathObjectType(currentObjectType);
      }
    };

    buildChoices();

    return () => {
      cancelled = true;
    };
  }, [dataSource, originalObjectType, path]);

  const handleSelect = (value: string | null) => {
    if (!value) return;

    const nextValues = [...values, value];
    const nextPath = nextValues.join(RELATIONSHIP_SEPARATOR);
    const selectedChoice = choices.find((choice) => choice.value === value);
    const shouldClose = !!targetObjectType && selectedChoice?.targetObjectType === targetObjectType;

    setValues(nextValues);
    if (selectedChoice?.targetObjectType) {
      setCurrentPathObjectType(selectedChoice.targetObjectType);
    }
    closeFromSelectionRef.current = shouldClose;
    setOpen(!shouldClose);
    onChange?.(nextPath);
  };

  const handleClean = () => {
    setValues([]);
    setCurrentPathObjectType(originalObjectType);
    setOpen(!!targetObjectType);
    onChange?.("");
  };

  const internalPathComplete = !!targetObjectType
    && values.length > 0
    && currentPathObjectType === targetObjectType;
  const effectivePathComplete = pathComplete ?? internalPathComplete;

  useEffect(() => {
    setPathComplete?.(internalPathComplete);
  }, [internalPathComplete, setPathComplete]);

  const handleOpen = () => {
    closeFromSelectionRef.current = null;
    const hasCompletedPath = !!targetObjectType && values.length > 0 && effectivePathComplete;
    if (hasCompletedPath) {
      setValues([]);
      setCurrentPathObjectType(originalObjectType);
      onChange?.("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    if (closeFromSelectionRef.current === false) {
      closeFromSelectionRef.current = null;
      setOpen(true);
      return;
    }
    closeFromSelectionRef.current = null;
    setOpen(false);
  };

  const renderMenuItem = (label: string, choice: IRelationshipSelectorChoice) => (
    <>
      <span className={choice.targetObjectType === targetObjectType ? "tol-success-colour" : ""}>
        {normaliseCaps(label)}
      </span>
      <span className="tol-grey-colour tol-ml-sm">
        {normaliseCaps(choice.targetObjectType)}
      </span>
    </>
  );

  const renderValue = () => (
    values.map((value) => normaliseCaps(value)).join(' > ')
  );

  const selectedRelationship = values.length > 0
    ? values[values.length - 1]
    : null;

  return (
    <SelectPicker
      block
      className={className}
      data={choices}
      value={selectedRelationship}
      cleanable
      open={open}
      placeholder={placeholder}
      onOpen={handleOpen}
      onClose={handleClose}
      onChange={(value) => handleSelect(typeof value === "string" ? value : null)}
      onClean={handleClean}
      renderMenuItem={renderMenuItem}
      renderValue={renderValue}
    />
  );
}