/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useMemo, useState } from "react";
import { Schema } from "rsuite";

import {
  Button,
  BUTTONS,
  convertCustomFieldPythonTypeToFormField,
  fetchCustomFieldFunctions,
  FormAllInOne,
  FormComponentWrapper,
  FormTextField,
  Modal,
  RSForm,
  SingleSelect,
  TolLoader
} from "../..";
import type {
  IFormConfig,
  IRemoteTarget,
  IRuntimeFieldFunction,
  TFormField,
} from "../..";

export interface PCustomFieldModal extends IRemoteTarget {
  /**
   * Data source used for any custom field parameters that are field names
   * (and thus require an AttributeSelector)
   */
  attributeDataSource: IRemoteTarget["dataSource"];
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
    dataSource: configDataSource,
    attributeDataSource,
    objectType,
  } = props;

  const [availableFunctions, setAvailableFunctions] = useState<
    IRuntimeFieldFunction[] | undefined
  >();
  const [chosenName, setChosenName] = useState<string>("");
  const [chosenFunction, setChosenFunction] = useState<string | undefined>();

  // Calculate which controls need to be shown (if any) to configure the custom field parameters
  const [paramsFormConfig, paramsFormModel, paramsInitialData] = useMemo(() => {
    const config: IFormConfig = {
      fields: []
    };
    const model = Schema.Model({});
    const initialData: Record<string, unknown> = {};

    if (!availableFunctions || !chosenFunction) {
      return [config, model, initialData] as const;
    }

    const functionDetails = availableFunctions.find(fn => fn.name == chosenFunction);
    if (!functionDetails) {
      console.error(`Unable to fetch function details for ${chosenFunction}`);
      return [config, model, initialData] as const;
    }

    for (const [paramName, paramDetails] of Object.entries(functionDetails.params)) {
      const [fieldConfig, fieldModel] = convertCustomFieldPythonTypeToFormField(
        paramDetails.pythonType
      );

      config.fields.push({
        ...fieldConfig,
        ...(fieldConfig.type === "attributeselector" && {
          dataSource: attributeDataSource,
          objectType,
        }),
        name: paramName,
        label: paramName
      } as TFormField);
      model[paramName] = fieldModel;
      initialData[paramName] = paramDetails.defaultValue;
    }

    return [config, model, initialData] as const;
  }, [chosenFunction, availableFunctions, attributeDataSource, objectType]);

  // Reset the user's choices
  const handleReset = () => {
    // Set the available functions to undefined but start fetching them
    setAvailableFunctions(undefined);
    fetchCustomFieldFunctions(configDataSource).then(setAvailableFunctions);

    setChosenFunction(undefined);
  };

  // Upsert the new custom field configuration to the database
  const handleSave = () => {
    console.log(`Creating new custom field called ${chosenName} using function ${chosenFunction}`);
  };

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      onOpen={handleReset}
      header={<h4>{customFieldId ? "Edit Custom Field" : "Create Custom Field"}</h4>}
      actionButton={<Button {...BUTTONS.CONFIRM} onClick={handleSave} />}
    >
      <RSForm fluid>
        <FormTextField
          id="custom-field-modal-top"
          name="name"
          label="Name"
          type="text"
          value={chosenName}
          onChange={setChosenName}
        />
        <FormComponentWrapper name="function" label="Function">
          {availableFunctions === undefined ? (
            <TolLoader />
          ) : (
            <SingleSelect
              block
              data={availableFunctions.map(fn => fn.name)}
              value={chosenFunction || ""}
              onChange={setChosenFunction}
            />
          )}
        </FormComponentWrapper>
      </RSForm>
      {chosenFunction && availableFunctions && (
        <FormAllInOne
          formConfig={paramsFormConfig}
          model={paramsFormModel}
          initialData={paramsInitialData}
        />
      )}
    </Modal>
  );
}
