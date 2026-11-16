/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  CARD_KEY_TYPE,
  getField,
  normaliseCaps,
  ObjectDetail,
  RemoteComponentDataList,
  SingleSelect,
} from "..";
import type {
  IFieldCard,
  TFieldOptionsContent,
  TAdditionalOptionsContent,
  TCardKeyType,
  TRemoteComponentDataList,
  PObjectDetailOptions,
} from "..";

/** Props for the `RemoteObjectDetail` component. */
export interface PRemoteObjectDetail extends PObjectDetailOptions, TRemoteComponentDataList<PObjectDetailOptions> { }

/** A remote version of the `ObjectDetail` component that fetches its data remotely. */
export function RemoteObjectDetail(props: PRemoteObjectDetail) {
  const { keyType } = props;

  const FieldOptionsContent = ({ attributeId, fieldMeta, setFieldMeta }: TFieldOptionsContent) => {
    const field = getField(fieldMeta, attributeId);
    const position = field && "position" in field ? field.position : "left";
    const fieldKeyType = field && "keyType" in field ? field.keyType : undefined;

    const updateField = (options: Partial<IFieldCard>) => {
      setFieldMeta((previous) => {
        const nextField: IFieldCard = {
          position: position ?? "left",
          ...previous.data?.[attributeId],
          ...options,
        };
        // Default removes the saved override, rather than fixing the field to today's component setting.
        if ("keyType" in options && options.keyType === undefined) delete nextField.keyType;
        const nextFieldWithDefaults = {
          ...previous.dataWithDefaults?.[attributeId],
          ...nextField,
        };
        if ("keyType" in options && options.keyType === undefined) delete nextFieldWithDefaults.keyType;
        return {
          ...previous,
          data: { ...previous.data, [attributeId]: nextField },
          dataWithDefaults: { ...previous.dataWithDefaults, [attributeId]: nextFieldWithDefaults },
        };
      });
    };

    return (
      <>
        <h6 className="tol-mb-sm">Position:</h6>
        <SingleSelect
          block
          cleanable={false}
          searchable={false}
          data={[{ label: "Left", value: "left" }, { label: "Right", value: "right" }]}
          value={position}
          onChange={(value) => {
            if (value !== "left" && value !== "right") return;
            updateField({ position: value });
          }}
        />
        <h6 className="tol-mt-md tol-mb-sm">Key Type:</h6>
        <SingleSelect
          block
          cleanable={false}
          searchable={false}
          data={[
            { label: "Default (component setting)", value: "default" },
            ...CARD_KEY_TYPE.map((type) => ({ label: normaliseCaps(type), value: type })),
          ]}
          value={fieldKeyType ?? "default"}
          onChange={(value) => {
            if (value === "default") updateField({ keyType: undefined });
            else if (CARD_KEY_TYPE.includes(value as TCardKeyType)) {
              updateField({ keyType: value as TCardKeyType });
            }
          }}
        />
      </>
    );
  };

  const AdditionalOptionsContent = ({
    additionalOptions,
    setAdditionalOptions
  }: TAdditionalOptionsContent<PObjectDetailOptions>) => {

    return (
      <>
        <h6 className="tol-mt-md tol-mb-sm">Key Type:</h6>
        <SingleSelect
          block
          cleanable={false}
          searchable={false}
          data={CARD_KEY_TYPE.map((type) => ({ label: normaliseCaps(type), value: type }))}
          value={additionalOptions.keyType ?? keyType ?? "standard"}
          onChange={(value) => setAdditionalOptions({ ...additionalOptions, keyType: value as TCardKeyType })}
        />
      </>
    );
  }

  return (
    <RemoteComponentDataList
      {...props}
      componentDefaultPageSize={1}
      AdditionalOptionsContent={AdditionalOptionsContent}
      FieldOptionsContent={FieldOptionsContent}
    >
      <ObjectDetail {...props} />
    </RemoteComponentDataList>
  );
}
