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
  TDataObjectListOrNull,
  TDataObjectOrNull,
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

  const [selectableDataspaces, setSelectableDataspaces] = useState<Record<string, IDataspace> | undefined>();
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

  // Queries the data_source_instance table to fetch all of the dataspaces the user can pick from
  // This allows us to use their names as the data in the dataspace singleselect, and also lets
  // us use their information (url, apiPath, apiDataPath, dataspace) to make a new IDataspace
  // object (in `selectDataspace`) when the user selects one
  const fetchSelectableDataspaces = () => {
    boardDataSource
      .getListPage({ 
        objectType: "data_source_instance",
        pageSize: 100,
      })
      .then((data: TDataObjectListOrNull) => {
        let newSelectableDataspaces: Record<string, IDataspace> = {};
        data?.forEach((instance: TDataObjectOrNull) => {
          newSelectableDataspaces[instance?.api_details.dataspace] = {
            dataSourceInstanceId: instance?.id as string,  // TODO: would the query every return undefined for id? It's a primary key
            dataSource: new TsDataSource({
              url: instance?.api_details.url,
              apiPath: instance?.api_details.api_path,
              apiDataPath: instance?.api_details.api_data_path,
              dataspace: instance?.api_details.dataspace
            })
          }
        });

        setSelectableDataspaces(newSelectableDataspaces);
        setDataspaceNames(Object.keys(newSelectableDataspaces));
      })
      .catch((error: any) => {
        console.error("Error fetching data source instances:", error);
        alert("There was an error fetching the required data for this form");
      });
  };

  useEffect(() => {
    if (open) {
      fetchSelectableDataspaces();
    } else {  // Closed 
      reset();
    }
  }, [open]);

  const selectDataspace = (dataspaceName: string) => {
    const newDataspace: IDataspace = selectableDataspaces[dataspaceName];
    setDataspace(newDataspace);

    newDataspace.dataSource.attributeMetadata().then((am) => {
      setObjectTypesList(
        Object.keys(am)
      );
    });
  };

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
              selectDataspace(newValue);
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
            disabled={!dataspaceName}
            disabledTooltip="You must select a dataspace first"
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
