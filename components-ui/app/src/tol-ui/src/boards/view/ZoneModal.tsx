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
    dataSource,
    boardDataSource,
  } = props;

  const [objectType, setObjectType] = useState("");
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [fieldError, setFieldError] = useState(false);
  const [objectTypesList, setObjectTypesList] = useState<string[]>([]);

  function reset() {
    setObjectType("");
    setTitle("");
    setTitleError(false);
    setFieldError(false);
  }

  function checkStates() {
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

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  useEffect(() => {
    dataSource.attributeMetadata().then((am) => {
      setObjectTypesList(
        Object.keys(am)
      );
    });
  }, []);

  const onAddZone = async () => {
    if (checkStates()) {
      const nextOrder = getNextZoneOrder(zoneOrder);
      const newZone: IUpdatedZoneIds = await upsertNewZone(
        dataSource,
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
        position="right"
        type="success"
        onClick={onAddZone}
        icon="plus"
        text="Add Zone"
        testid="add-zone-button"
      />
      <Button
        position="right"
        type="error"
        onClick={() => setOpen(false)}
        icon="times"
        text="Cancel"
      />
    </div>
  );

  return (
    <div className="confirm-delete-buttons">
      <Modal
        open={open}
        size="xs"
        setOpen={setOpen}
        actionButton={ActionButtons}
        closeButton={false}
        overflow={false}
        data-testid="zoneModal"
      >
        <div>
          <h4>Add New Zone</h4>
          <p className="zone-modal-labels">
            Select Object Type <span className="tol-danger-colour">*</span>
          </p>
          <SingleSelect
            data={objectTypesList}
            placeholder="Object Type"
            value={objectType}
            setValue={setObjectType}
            block
          />
          <br />
          <p className="zone-modal-labels">
            Enter Title <span className="tol-danger-colour">*</span>
          </p>
          <RSForm fluid>
            <FormTextField
              id="zone-title"
              onChange={(value: any) => setTitle(value)}
              name="Zone Title"
              placeholder={`Zone Title`}
              label=""
            />
          </RSForm>
          {titleError ? (
            <p className="tol-modal-error">Title cannot be blank</p>
          ) : null}
          {fieldError ? (
            <p className="tol-modal-error">
              Please ensure all mandatory fields are filled
            </p>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
