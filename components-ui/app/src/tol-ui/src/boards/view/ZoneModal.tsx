/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState, React } from "react";
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
  InfoTooltip,
  IDataspace,
  TsDataSource,
} from "../..";


export interface PZoneModal extends PBoard {
  open: boolean;
  setOpen: any;
  zones: IDBZone[];
  setZones: (zone: IDBZone[]) => void;
  zoneOrder: IDBZoneView[];
  setZoneOrder: (zone: IDBZoneView[]) => void;
  viewId: string;
  dataspace: IDataspace | undefined;
  setDataspace: React.Dispatch<React.SetStateAction<IDataspace | undefined>>;
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
    dataspace,
    setDataspace,
    boardDataSource,
  } = props;

  const [dataspaceNames, setDataspaceNames] = useState(["tol_production"]);
  const [dataspaceName, setDataspaceName] = useState("tol_production");
  const [objectType, setObjectType] = useState("");
  const [title, setTitle] = useState("");
  const [mandatoryFieldsFilled, setMandatoryFieldsFilled] = useState(false);
  const [objectTypesList, setObjectTypesList] = useState<string[]>([]);

  const reset = () => {
    setTitle("");
    setObjectType("");
    setMandatoryFieldsFilled(false);
  };

  const validateForm = ({
    newDataspace = dataspaceName,
    newObjectType = objectType,
    newTitle = title,
  }) => {
    if (!newDataspace || !newObjectType || !newTitle) {
      setMandatoryFieldsFilled(false);
      return false;
    } else {
      setMandatoryFieldsFilled(true);
      return true;
    }
  };

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      // Default dataspace is tol_production
      const dataspace: IDataspace = {
        dataSourceInstanceId: 1,
        dataSource: new TsDataSource({
          // TEMP! THIS CAN BE DONE BETTER BUT I NEED SOMETHING TO FETCH FROM
          url: "https://portal.tol.sanger.ac.uk",
          apiPath: "/api/v1",
          apiDataPath: "/data",
          dataspace: dataspaceName
        })
      };
      setDataspace(dataspace);

      dataspace.dataSource.attributeMetadata().then((am) => {
        setObjectTypesList(
          Object.keys(am)
        );
      });
    }
  }, [open]);

  const onAddZone = async () => {
    if (!dataspace) return;  // Shouldn't happen

    if (validateForm({})) {
      const nextOrder = getNextZoneOrder(zoneOrder);
      const newZone: IUpdatedZoneIds = await upsertNewZone(
        dataspace.dataSource,
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
        testid="confirm-zone-button"
        disabled={!mandatoryFieldsFilled}
        disabledTooltip="Please ensure all mandatory fields are filled"
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
            Select Dataspace
            &nbsp;
            <span className="tol-param-info">
              <InfoTooltip contents={"The set of data to pull from"} disableMarkdown />
            </span>
            &nbsp;
            <span className="tol-danger-colour">*</span>
          </p>
          <SingleSelect
            data={dataspaceNames}
            placeholder="Dataspace"
            value={dataspaceName}
            setValue={(newValue) => {
              validateForm({ newDataspace: newValue });
              setDataspaceName(newValue);
            }}
            block
          />
          <br/>
          <p className="zone-modal-labels">
            Select Object Type
            &nbsp;
            <span className="tol-param-info">
              <InfoTooltip contents={"The type of data this zone will focus on"} disableMarkdown />
            </span>
            &nbsp;
            <span className="tol-danger-colour">*</span>
          </p>
          <SingleSelect
            data={objectTypesList}  // Which might be empty but that's okay
            placeholder="Object Type"
            value={objectType}
            setValue={(newValue) => {
              validateForm({ newObjectType: newValue });
              setObjectType(newValue);
            }}
            block
          />
          <br />
          <p className="zone-modal-labels">
            Enter Title
            &nbsp;
            <span className="tol-param-info">
              <InfoTooltip contents={"The title to be displayed for this zone"} disableMarkdown />
            </span>
            &nbsp;
            <span className="tol-danger-colour">*</span>
          </p>
          <RSForm fluid>
            <FormTextField
              id="zone-title"
              onChange={(newValue: any) => {
                validateForm({ newTitle: newValue });
                setTitle(newValue);
              }}
              name="Zone Title"
              placeholder={`Zone Title`}
              label=""
            />
          </RSForm>
        </div>
      </Modal>
    </div>
  );
}
