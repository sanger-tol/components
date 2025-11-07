/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  SingleSelect,
  RSForm,
  upsertNewZone,
  FormTextField,
  PBoard,
  IDBZoneView,
  IUpdatedZoneIds,
  IDBZone,
  getNextZoneOrder,
  BUTTONS,
  RequiredAsterisk,
  fetchPublishedDataspaces,
  TLabelAndValueData,
  TsDataSource,
  normaliseCaps,
} from "../..";


export interface PZoneModal extends PBoard {
  open: boolean;
  setOpen: any;
  zones: IDBZone[];
  setZones: (zone: IDBZone[]) => void;
  zoneOrder: IDBZoneView[];
  setZoneOrder: (zone: IDBZoneView[]) => void;
  viewId: string;
}

export function ZoneModal(props: PZoneModal) {
  const {
    open,
    setOpen,
    setZones,
    zones,
    zoneOrder,
    setZoneOrder,
    viewId,
    boardDataSource,
  } = props;

  const [dataSourceInstancesLoading, setDataSourceInstancesLoading] = useState(true);
  const [dataSourceInstanceList, setDataSourceInstanceList] = useState<TLabelAndValueData>([]);
  const [dataSourceInstance, setDataSourceInstance] = useState<string>("");
  const [dataspace, setDataspace] = useState<TsDataSource>();
  const [objectTypesLoading, setObjectTypesLoading] = useState(false);
  const [objectTypesList, setObjectTypesList] = useState<TLabelAndValueData>([]);
  const [objectType, setObjectType] = useState("");

  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [fieldError, setFieldError] = useState(false);

  useEffect(() => {
    if (open) {
      fetchPublishedDataspaces(
        boardDataSource
      )
        .then((dataObjects) => {
          if (dataObjects) {
            const dsiList = dataObjects.map((dsi) => ({
              label: normaliseCaps(dsi.name),
              value: dsi.id,
              api_details: dsi.api_details,
            }));
            setDataSourceInstanceList(dsiList);
            setDataSourceInstance(dsiList[0].value);
          }
        }).finally(() => {
          setDataSourceInstancesLoading(false);
        });
    } else {
      reset();
    }
  }, [open]);

  // update the dataspace meta when the instance id changes
  useEffect(() => {
    if (dataSourceInstance) {
      const apiDetails = dataSourceInstanceList
        .find((dsi) => dsi.value === dataSourceInstance)?.api_details;
      setDataspace(
        new TsDataSource({
          url: apiDetails.url,
          apiPath: apiDetails.api_path,
          apiDataPath: apiDetails.api_data_path,
          dataspace: apiDetails.dataspace,
          dataSourceInstanceId: dataSourceInstance,
        })
      );
    }
  }, [dataSourceInstance]);

  useEffect(() => {
    if (dataspace) {
      setObjectTypesLoading(true);
      dataspace.attributeMetadata()
        .then((am) => {
          setObjectTypesList(
            Object.keys(am).map((type) => ({
              label: normaliseCaps(type),
              value: type,
            }))
          );
        })
        .finally(() => {
          setObjectTypesLoading(false);
        });
    } else {
      setObjectTypesList([]);
      setObjectType("");
    }
  }, [dataspace]);

  const reset = () => {
    setObjectType("");
    setTitle("");
    setTitleError(false);
    setFieldError(false);
  };

  const validateInputs = () => {
    setTitleError(false);
    setFieldError(false);
    let validId = true;
    let validField = true;

    if (title === "") {
      setTitleError(true);
      validId = false;
    }
    if (objectType === "" || objectType === null) {
      setFieldError(true);
      validField = false;
    }
    return validId && validField;
  }

  const onAddZone = async () => {
    if (validateInputs()) {
      const nextOrder = getNextZoneOrder(zoneOrder);
      const newZone: IUpdatedZoneIds = await upsertNewZone(
        boardDataSource,
        objectType,
        title,
        nextOrder,
        viewId,
        dataspace!.getDataSourceInstanceId()!,
      );
      setZones([
        ...zones,
        {
          id: newZone.newZoneId,
          objectType: objectType,
          dataspace: dataspace,
          title: title,
        },
      ]);
      setZoneOrder([
        ...zoneOrder,
        {
          zoneId: newZone.newZoneId,
          order: nextOrder,
          zoneViewId: newZone.newZoneViewId,
        },
      ]);
      reset();
      setOpen(false);
    }
  };

  const ActionButtons = (
    <div>
      <Button
        {...BUTTONS.ADD}
        onClick={onAddZone}
        disabled={objectType === "" || title === ""}
        testid="confirm-zone-button"
      />
      <Button
        {...BUTTONS.CANCEL}
        onClick={() => setOpen(false)}
      />
    </div>
  );

  return (
    <Modal
      open={open}
      size="xs"
      setOpen={setOpen}
      actionButton={ActionButtons}
      closeButton={false}
      overflow={false}
      data-testid="zoneModal"
    >
      <h4>Add New Zone</h4>
      <p className="zone-modal-labels">
        Select Dataspace <RequiredAsterisk />
      </p>
      <SingleSelect
        block
        data={dataSourceInstanceList}
        placeholder="Dataspace"
        value={dataSourceInstance}
        onChange={setDataSourceInstance}
        loading={dataSourceInstancesLoading}
      />
      <br />
      <p className="zone-modal-labels">
        Select Object Type <RequiredAsterisk />
      </p>
      <SingleSelect
        block
        data={objectTypesList}
        placeholder="Object Type"
        value={objectType}
        onChange={setObjectType}
        disabled={!dataSourceInstance}
        loading={objectTypesLoading}
      />
      <br />
      <p className="zone-modal-labels">
        Enter Title <RequiredAsterisk />
      </p>
      <RSForm fluid>
        <FormTextField
          id="zone-title"
          onChange={(value: any) => setTitle(value)}
          name="Zone Title"
          placeholder="Zone Title"
          label=""
        />
      </RSForm>
      <>
        {titleError && (
          <p className="tol-modal-error">Title cannot be blank</p>
        )}
        {fieldError && (
          <p className="tol-modal-error">
            Please ensure all mandatory fields are filled
          </p>
        )}
      </>
    </Modal>
  );
}
