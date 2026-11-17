/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";

import {
  Button,
  BUTTONS,
  fetchCustomFieldFunctions,
  Modal,
  SingleSelect,
  TolLoader
} from "../..";
import type {
  IRemoteTarget,
  IRuntimeFieldFunction,
} from "../..";

export interface PCustomFieldModal extends IRemoteTarget {
  /** Whether the modal is currently open */
  open: boolean;
  /** Callback to control whether this modal is open */
  setOpen: (open: boolean) => void;
  /** The ID of the custom field to edit. If `undefined`, this modal creates a new field */
  customFieldId?: number | undefined;
}

export default function CustomFieldModal(props: PCustomFieldModal) {
  const {
    open,
    setOpen,
    customFieldId,
    objectType,
    dataSource: configDataSource,
  } = props;

  const [availableFunctions, setAvailableFunctions] = useState<
    IRuntimeFieldFunction[] | undefined
  >();
  const [chosenFunction, setChosenFunction] = useState<string | undefined>();

  const resetEverything = () => {
    // Set the available functions to undefined but start fetching them
    setAvailableFunctions(undefined);
    fetchCustomFieldFunctions(configDataSource).then(setAvailableFunctions);

    setChosenFunction(undefined);
  };

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      onOpen={resetEverything}
      header={<h4>{customFieldId ? "Edit Custom Field" : "Create Custom Field"}</h4>}
      actionButton={<Button {...BUTTONS.CONFIRM} />}
    >
      {availableFunctions === undefined ? (
        <TolLoader />  
      ) : (
        <SingleSelect
          data={availableFunctions.map(fn => fn.name)}
          value={chosenFunction || ""}
          onChange={setChosenFunction}
        />
      )}
    </Modal>
  );
}
