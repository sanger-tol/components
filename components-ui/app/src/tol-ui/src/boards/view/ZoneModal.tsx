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
  TDataObjectListOrNull,
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

  const [dataSourceInstancesLoading, setDataSourceInstancesLoading] = useState(false);
  const [dataSourceInstanceList, setDataSourceInstanceList] = useState<TLabelAndValueData>([]);
  const [dataSourceInstance, setDataSourceInstance] = useState<TsDataSource>();
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
            setDataSourceInstanceList(
              dataObjects.map((dsi) => ({
                label: dsi.name,
                value: {
                  id: dsi.id,
                  apiDetails: dsi.api_details,
                }
              }))
            );
          }
        }).finally(() => {
          setDataSourceInstancesLoading(false);
        });
    } else {
      reset();
    }
  }, [open]);

  useEffect(() => {
    if (dataSourceInstance) {
      setObjectTypesLoading(true);
      dataSourceInstance.attributeMetadata()
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
  }, [dataSourceInstance]);

  const onSelectDataspace = (dsi: any) => {
    setDataSourceInstance(
      dsi ? new TsDataSource(dsi.api_details) : undefined
    );
    console.log(dsi);
  }

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
      );
      setZones([
        ...zones,
        {
          id: newZone.newZoneId,
          objectType: objectType,
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
        value={dataSourceInstance?.id}
        onChange={onSelectDataspace}
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
