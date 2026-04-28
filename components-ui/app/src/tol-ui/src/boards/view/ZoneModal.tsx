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
  FormTextField,
  PBoard,
  getNextZoneOrder,
  BUTTONS,
  RequiredAsterisk,
  getPublishedDataspaces,
  TLabelAndValueData,
  TsDataSource,
  normaliseCaps,
  PopUpMessage,
  IView,
} from "../..";


export interface PZoneModal extends PBoard {
  open: boolean;
  setOpen: any;
  viewId: string;
  view: IView;
  setView: (view: IView) => void;
}

export function ZoneModal(props: PZoneModal) {
  const {
    open,
    setOpen,
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

  useEffect(() => {
    if (open) {
      getPublishedDataspaces(boardDataSource)
        .then((dataObjects) => {
          if (dataObjects) {
            const dsiList = dataObjects.map((dsi) => {
              return {
                label: normaliseCaps(dsi!.id),
                value: dsi!.id,
                ui_api_details: dsi!.ui_api_details,
              };
            });
            setDataSourceInstanceList(dsiList);
            // TODO: new solution for pre-selecting tol data
            if (dsiList.map((dsi) => dsi.value).includes("tol_production")) {
              setDataSourceInstance("tol_production");
            } else {
              setDataSourceInstance(dsiList[0].value);
            }
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
        .find((dsi) => dsi.value === dataSourceInstance)?.ui_api_details;
      setDataspace(
        new TsDataSource({
          ...apiDetails,
          dataSourceInstanceId: dataSourceInstance,
        })
      );
    } else {
      setDataspace(undefined);
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
        .catch((err) => {
          console.error("Error fetching attribute metadata:", err);
          PopUpMessage({
            type: "error",
            message: `Failed to fetch Dataspace '${normaliseCaps(dataSourceInstance)}'.
              Please refresh and try again.`,
          });
          setDataSourceInstance("");
          setDataspace(undefined);
          setObjectTypesList([]);
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
  };

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
        disabled={objectType === ""}
        testid="add-zone-button"
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
        testid="dataspace-picker"
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
        disabled={!dataspace}
        loading={objectTypesLoading}
        testid="object-type-picker"
      />
    </Modal>
  );
}
