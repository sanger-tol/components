/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useMemo, useRef, useState } from "react";
import { Schema } from "rsuite";

import {
  AreYouSureModal,
  Button,
  BUTTONS,
  convertCustomFieldPythonTypeToFormField,
  fetchCustomFieldFunctions,
  FormAllInOne,
  FormComponentWrapper,
  FormTextField,
  Modal,
  PopUpMessage,
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
  /** Tells the MyFields tab to refresh its contents, called after an upsert succeeds */
  refreshCustomFieldList: () => void | Promise<void>;
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
    refreshCustomFieldList,
  } = props;

  const [availableFunctions, setAvailableFunctions] = useState<
    IRuntimeFieldFunction[] | undefined
  >();
  const [storedParams, setStoredParams] = useState<Record<string, any> | undefined>();
  const [chosenName, setChosenName] = useState<string>("");
  const [chosenReturnType, setChosenReturnType] = useState<string>("");
  const [chosenDescription, setChosenDescription] = useState<string>("");
  const [chosenFunction, setChosenFunction] = useState<string | undefined>();
  const [chosenParams, setChosenParams] = useState<Record<string, unknown>>({});
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const paramsValidationRef = useRef<(() => boolean) | null>(null);

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

  // Populate existing values each time an edit modal opens, even for the same field.
  useEffect(() => {
    // `customFieldId` is undefined when the modal is creating a field.
    if (!open || customFieldId === undefined) return;

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
      setChosenReturnType(response.runtime_definition["type"] ?? "");
      setChosenFunction(response.runtime_definition["function"]);
      setStoredParams(response.runtime_definition["function_kwargs"] ?? {});
    }).catch((error: unknown) => {
      PopUpMessage({ type: "error", message: "Unable to fetch existing custom field information" });
      console.log(`Could not fetch existing custom field information for ID ${customFieldId}: `);
      console.log(error);
      setStoredParams({});
    });
  }, [open, customFieldId, configDataSource]);

  // Reset the user's choices
  const handleReset = () => {
    // Set the available functions to undefined but start fetching them
    setAvailableFunctions(undefined);
    fetchCustomFieldFunctions(configDataSource).then(setAvailableFunctions);

    setStoredParams(customFieldId === undefined ? {} : undefined);
    setChosenName("");
    setChosenReturnType("");
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
      Schema.Types.StringType().isRequired().check(chosenReturnType),
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
    const normalisedFunctionKwargs = Object.fromEntries(
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

    try {
      await configDataSource.upsert({ objectType: "custom_field", payload: [{
        type: "custom_field",
        ...(customFieldId !== undefined && { id: String(customFieldId) }),
        attributes: {
          "user_id": userId,
          "data_source_config_id": dataSourceConfigId,
          "object_type": objectType,
          "display_name": chosenName,
          "description": chosenDescription || null,
          "runtime_definition": {
            "type": chosenReturnType,
            "function": chosenFunction,
            "function_kwargs": normalisedFunctionKwargs,
          }
        }
      }]});

      // Keep the modal open until both persistence and the resulting refresh succeed.
      await refreshCustomFieldList?.();
      PopUpMessage({
        type: "success",
        message: "Field saved successfully"
      });
      setOpen(false);
    } catch (error: unknown) {
      console.log(error);
      PopUpMessage({
        type: "error",
        message: "Failed to save field"
      });
    }
  };

  const handleDelete = async () => {
    if (customFieldId === undefined) {
      console.error("Attempted to delete a custom field without an ID");
      return;
    }

    try {
      await configDataSource.deleteByID({
        objectType: "custom_field",
        id: String(customFieldId),
      });
      await refreshCustomFieldList();
      PopUpMessage({
        type: "success",
        message: "Field deleted successfully",
      });
      setOpen(false);
    } catch (error: unknown) {
      console.error(error);
      PopUpMessage({
        type: "error",
        message: "Unable to delete this custom field",
      });
    }
  };

  const Header = (
    <span className="tol-custom-field-modal__header">
      <h4 id="custom-field-modal__title">
        {customFieldId ? "Edit Custom Field" : "Create Custom Field"}
      </h4>
      <Button
        {...BUTTONS.DELETE}
        onClick={() => setDeleteConfirmationOpen(true)}
        disabled={customFieldId === undefined}
        disabledTooltip="You can't delete a field that doesn't exist"
      />
    </span>
  );

  const SaveButton = (
    <Button
      {...BUTTONS.SAVE}
      onClick={handleSave}
      disabled={!chosenFunction}
    />
  );

  return (
    <>
      <Modal
        className="tol-custom-field-modal"
        open={open}
        setOpen={setOpen}
        onOpen={handleReset}
        header={Header}
        aria-labelledby="custom-field-modal__title"
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
          id="custom-field-return-type"
          name="returnType"
          label="Return Type"
          type="text"
          value={chosenReturnType}
          onChange={setChosenReturnType}
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
        {chosenFunction && availableFunctions ? (
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
        ) : <></>}
      </Modal>
      <AreYouSureModal
        open={deleteConfirmationOpen}
        setOpen={setDeleteConfirmationOpen}
        title="Delete Custom Field"
        message="Are you sure you want to delete this custom field? This cannot be undone."
        onConfirm={handleDelete}
        confirmButton={BUTTONS.DELETE}
      />
    </>
  );
}
