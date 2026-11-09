/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  normaliseCaps,
  ObjectDetail,
  RemoteComponentDataList,
  SingleSelect,
} from "..";
import type {
  TAdditionalOptionsContent,
  TObjectDetailKeyType,
  TRemoteComponentDataList,
  PObjectDetailOptions,
} from "..";

/** Props for the `RemoteObjectDetail` component. */
export interface PRemoteObjectDetail extends PObjectDetailOptions, TRemoteComponentDataList<PObjectDetailOptions> { }

/** A remote version of the `ObjectDetail` component that fetches its data remotely. */
export function RemoteObjectDetail(props: PRemoteObjectDetail) {
  const { keyType } = props;

  const AdditionalOptionsContent = ({
    additionalOptions,
    setAdditionalOptions
  }: TAdditionalOptionsContent<PObjectDetailOptions>) => {

    const keyTypes: TObjectDetailKeyType[] = ["standard", "heading", "none"];

    return (
      <>
        <h6 className="tol-mt-md tol-mb-sm">Key Type:</h6>
        <SingleSelect
          block
          cleanable={false}
          searchable={false}
          data={keyTypes.map((type) => ({ label: normaliseCaps(type), value: type }))}
          value={additionalOptions.keyType ?? keyType ?? "standard"}
          onChange={(value) => setAdditionalOptions({ ...additionalOptions, keyType: value as TObjectDetailKeyType })}
        />
      </>
    );
  }

  return (
    <RemoteComponentDataList
      {...props}
      componentDefaultPageSize={1}
      AdditionalOptionsContent={AdditionalOptionsContent}
    >
      <ObjectDetail {...props} />
    </RemoteComponentDataList>
  );
}
