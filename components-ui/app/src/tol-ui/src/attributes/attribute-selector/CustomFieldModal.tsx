/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useMemo, useRef, useState } from "react";
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
  PopUpMessage,
  RequiredAsterisk,
  RSForm,
  SingleSelect,
  TolLoader
} from "../..";
import type {
  ICheckboxFormField,
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
  /** The ID of the currently logged in user */
  userId: number;
}

export default function CustomFieldModal(props: PCustomFieldModal) {
  const {
    open,
    setOpen,
    customFieldId,
    dataSource: configDataSource,
    attributeDataSource,
    objectType,
    userId,
  } = props;

  const [availableFunctions, setAvailableFunctions] = useState<
    IRuntimeFieldFunction[] | undefined
  >();
  const [storedParams, setStoredParams] = useState<Record<string, any> | undefined>();
  const [chosenName, setChosenName] = useState<string>("");
  const [chosenDescription, setChosenDescription] = useState<string>("");
  const [chosenFunction, setChosenFunction] = useState<string | undefined>();
  const [chosenParams, setChosenParams] = useState<Record<string, unknown>>({});
  const paramsValidationRef = useRef<(() => boolean) | undefined>(undefined);

  // Calculate which controls need to be shown (if any) to configure the custom field parameters
  const [paramsFormConfig, paramsFormModel, paramsInitialData] = useMemo(() => {
    const config: IFormConfig = {
      fields: []
    };
    const modelConfig: Record<string, any> = {};
    const initialData: Record<string, unknown> = {};

    if (!availableFunctions || !chosenFunction || storedParams === undefined) {
      return [config, Schema.Model(modelConfig), initialData] as const;
    }

    const functionDetails = availableFunctions.find(fn => fn.name == chosenFunction);
    if (!functionDetails) {
      console.error(`Unable to fetch function details for ${chosenFunction}`);
      return [config, Schema.Model(modelConfig), initialData] as const;
    }

    for (const [paramName, paramDetails] of Object.entries(functionDetails.params)) {
      const [fieldConfig, fieldModel] = convertCustomFieldPythonTypeToFormField(
        paramDetails.pythonType
      );
      const paramInitalValue = storedParams[paramName] ?? paramDetails.defaultValue;

      // Checkboxes are an edge case because the "checkbox" form field
      // can actually contain multiple checkboxes
      if (fieldConfig.type == "checkbox") {
        // Add the checkbox to `checkboxConfig`
        (fieldConfig as ICheckboxFormField).checkboxConfig.fields = [{
          value: paramName,
          children: "",
        }];

        // Set the default value of the checkbox
        initialData[paramName] = paramInitalValue === true ? [paramName] : [];
      } else {
        // If it's anything other than a checkbox, set the default value too,
        // but the format is different
        initialData[paramName] = paramInitalValue;
      }

      config.fields.push({
        ...fieldConfig,
        ...(fieldConfig.type === "attributeselector" && {
          dataSource: attributeDataSource,
          objectType,
        }),
        name: paramName,
        label: paramName
      } as TFormField);
      modelConfig[paramName] = fieldModel;
    }

    return [config, Schema.Model(modelConfig), initialData] as const;
  }, [chosenFunction, availableFunctions, storedParams, attributeDataSource, objectType]);

  // When the modal opens, a new `customFieldId` will be provided.
  // If there's already data for this custom field, populate the form.
  useEffect(() => {
    // `customFieldId` can be `undefined` if we're creating a new field,
    // so we don't need to fetch anything
    if (!customFieldId) return;

    configDataSource.getOne({
      objectType: "custom_field",
      id: String(customFieldId),
      requestedFields: ["display_name", "description", "runtime_definition"]
    }).then((response) => {
      if (!response) {
        throw new Error(`Expected a data object from the backend but recieved ${response}`);
      }

      setChosenName(response.display_name);
      setChosenDescription(response.description ?? "");
      setChosenFunction(response.runtime_definition["function"]);
      setStoredParams(response.runtime_definition["function_kwargs"] ?? {});
    }).catch((error: unknown) => {
      PopUpMessage({ type: "error", message: "Unable to fetch existing custom field information" });
      console.log(`Could not fetch existing custom field information for ID ${customFieldId}: `);
      console.log(error);
      setStoredParams({});
    });
  }, [customFieldId]);

  // Reset the user's choices
  const handleReset = () => {
    // Set the available functions to undefined but start fetching them
    setAvailableFunctions(undefined);
    fetchCustomFieldFunctions(configDataSource).then(setAvailableFunctions);

    setStoredParams(customFieldId === undefined ? {} : undefined);
    setChosenName("");
    setChosenDescription("");
    setChosenFunction(undefined);
    setChosenParams({});
  };

  // Upsert the new custom field configuration to the database
  const handleSave = async () => {
    // Validate inputs not in FormAllInOne
    const functionChoices = availableFunctions ?? [];
    const validations = [
      Schema.Types.StringType().isRequired().check(chosenName),
      Schema.Types.StringType().isRequired().isOneOf(functionChoices.map(fn => fn.name)).check(chosenFunction),
      Schema.Types.StringType().check(chosenDescription),
    ];
    if (validations.some(result => result.hasError)) {
      PopUpMessage({ type: "error", message: "All fields but Description must be filled in" });
      console.error(
        "Top-half custom field form validations failed\n" +
        `VALIDATIONS: ${validations}`
      );
      return;
    }

    // Validate parameters (from FormAllInOne)
    if (chosenFunction && !paramsValidationRef.current?.()) {
      // There's no need for a PopUpMessage because the form itself will display the right data
      return;
    }

    // Normalise chosenParams from UI format to API format
    const normalizedFunctionKwargs = Object.fromEntries(
      paramsFormConfig.fields.map((field) => {
        const value = chosenParams[field.name];
        return [
          field.name,
          field.type === "checkbox"
            ? Array.isArray(value) && value.includes(field.name)
            : value,
        ];
      }),
    );

    // Get the data_source_config_id, which will be needed for the upsert
    let dataSourceConfigId: number | undefined;
    try {
      dataSourceConfigId = await attributeDataSource.getDataSourceConfigId(
        configDataSource,
      );
    } catch (error) {
      PopUpMessage({
        type: "error",
        message: "Unable to find the data source configuration for this dataspace",
      });
      console.error(error);
      return;
    }

    // I would be incredibly surprised if this is ever triggered
    // but thought it was worth including anyway
    if (dataSourceConfigId === undefined) {
      PopUpMessage({
        type: "error",
        message: "No data source configuration is associated with this dataspace",
      });
      return;
    }

    configDataSource.upsert({ objectType: "custom_field", payload: [{
      type: "custom_field",
      attributes: {
        "user_id": userId,
        "data_source_config_id": dataSourceConfigId,
        "object_type": objectType,
        "display_name": chosenName,
        "description": chosenDescription || null,
        "runtime_defintion": {
          "function": chosenFunction,
          "function_kwargs": normalizedFunctionKwargs,
        }
      }
    }]});
  };

  const SaveButton = (
    <Button
      {...BUTTONS.SAVE}
      onClick={handleSave}
      disabled={!chosenFunction}
    />
  );

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      onOpen={handleReset}
      header={<h4>{customFieldId ? "Edit Custom Field" : "Create Custom Field"}</h4>}
      actionButton={SaveButton}
    >
      <RSForm fluid>
        <FormTextField
          id="custom-field-name"
          name="name"
          label={"Name"}
          type="text"
          value={chosenName}
          onChange={setChosenName}
        />
        <FormTextField
          id="custom-field-description"
          name="description"
          label="Description"
          type="text"
          value={chosenDescription}
          onChange={setChosenDescription}
        />
        <FormComponentWrapper name="function" label="Function">
          {availableFunctions === undefined ? (
            <TolLoader />
          ) : (
            <SingleSelect
              block
              data={availableFunctions.map(fn => fn.name)}
              value={chosenFunction ?? ""}
              onChange={(value) => {
                setChosenFunction(value);
                setChosenParams({});
              }}
            />
          )}
        </FormComponentWrapper>
      </RSForm>
      {chosenFunction && availableFunctions && (
        <>
          <hr/>
          <FormAllInOne
            formConfig={paramsFormConfig}
            model={paramsFormModel}
            initialData={paramsInitialData}
            onFormDataChange={setChosenParams}
            validationRef={paramsValidationRef}
          />
        </>
      )}
    </Modal>
  );
}
