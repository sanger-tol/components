/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Row,
  Col,
  Icon,
  HoverOverlay,
  addComponent,
  IZone,
  componentOptions,
  sizeOptions,
  upsertNewComponent,
  PBoard,
  getNextComponentOrder,
  TsDataSource,
  RequiredAsterisk,
  BUTTONS,
} from "../..";


export interface PComponentPickerModal extends PBoard {
  open: boolean;
  setOpen: any;
  zone: IZone;
  setZone: any;
  zoneId: string;
  dataspace: TsDataSource;
}

export function ComponentPickerModal(props: PComponentPickerModal) {
  const {
    open,
    setOpen,
    zone,
    setZone,
    zoneId,
    dataspace,
    boardDataSource,
  } = props;
  const [componentType, setComponentType] = useState("");
  const [widgetType, setWidgetType] = useState("");

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  function reset() {
    setComponentType("");
    setWidgetType("");
  }

  const canAddComponent = componentType !== "" && widgetType !== "";

  const onAddComponent = async () => {
    if (canAddComponent) {
      const nextOrder = getNextComponentOrder(zone);
      const newComponent = await upsertNewComponent(
        dataspace,
        boardDataSource,
        zone.type!,
        "",
        nextOrder,
        componentType,
        widgetType,
        zoneId,
      );
      addComponent({
        id: newComponent.newComponentId,
        size: widgetType,
        type: componentType,
        order: nextOrder,
        componentZoneId: newComponent.newComponentZoneId,
        filter: { and_: {} },
        title: "",
        objectType: zone.type,
        dataspace: dataspace,
        config: {},
        filterPassThrough: false,
      }, zone);
      setZone({ ...zone });
      reset();
      setOpen(false);
    }
  };

  const PlusButton = (
    <Button
      {...BUTTONS.CONFIRM}
      onClick={onAddComponent}
      testid="confirm-add-component-button"
      disabled={!canAddComponent}
    />
  );

  return (
    <Modal
      open={open}
      size="md"
      setOpen={setOpen}
      actionButton={PlusButton}
      overflow={false}
      className={"dashboard-component-modal-full"}
    >
      <>
        <h6>
          Select Component <RequiredAsterisk />
        </h6>
        <Row>
          {componentOptions.map((option, index) => {
            return (
              <Col lg={3} md={3} sm={6} className="tol-button-col" key={index}>
                {!option.disabled ? (
                  <div
                    className={
                      componentType !== option.type
                        ? "tol-component-modal-btn"
                        : "tol-component-modal-btn-clicked"
                    }
                    onClick={() => {
                      setComponentType(option.type)
                      setWidgetType(option.defaultSize)
                    }}
                    data-testid={`component-option-${option.type}`}
                  >
                    <Icon icon={option.icon} size="4x" />
                    <h6>{option.text}</h6>
                  </div>
                ) : (
                  <HoverOverlay contents={"Coming Soon..."}>
                    <div
                      className={"tol-component-modal-btn-disabled"}
                    >
                      <Icon icon={option.icon} size="4x" />
                      <h6>{option.text}</h6>
                    </div>
                  </HoverOverlay>
                )}
              </Col>
            );
          })}
        </Row>
        <br />
        <h6>
          Select Size <RequiredAsterisk />
        </h6>
        <Row>
          {sizeOptions(componentType).map((option, index) => {
            return (
              <Col lg={4} md={4} sm={12} className="tol-button-col" key={index}>
                {!option.disabled ? (
                  <div
                    className={
                      widgetType !== option.type
                        ? "tol-component-modal-btn"
                        : "tol-component-modal-btn-clicked"
                    }
                    onClick={() => setWidgetType(option.type)}
                  >
                    <h5>{option.text}</h5>
                  </div>
                ) : (
                  <HoverOverlay contents={"Currently unavailable for this Component"}>
                    <div
                      className={"tol-component-modal-btn-disabled"}
                    >
                      <h5>{option.text}</h5>
                    </div>
                  </HoverOverlay>
                )}
              </Col>
            );
          })}
        </Row>
      </>
    </Modal>
  );
}
