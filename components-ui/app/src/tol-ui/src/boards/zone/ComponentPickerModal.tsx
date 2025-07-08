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
  FormTextField,
  RSForm,
  addComponent,
  IZone,
  componentOptions,
  sizeOptions,
  upsertNewComponent,
  PBoard,
  getNextComponentOrder,
} from "../..";


export interface PComponentPickerModal extends PBoard {
  open: boolean;
  setOpen: any;
  zone: IZone;
  setZone: any;
  zoneId: string;
}

export function ComponentPickerModal(props: PComponentPickerModal) {
  const {
    open,
    setOpen,
    zone,
    setZone,
    zoneId,
    dataSource,
    boardDataSource,
  } = props;
  const [componentType, setComponentType] = useState("");
  const [widgetType, setWidgetType] = useState("");
  const [title, setTitle] = useState<string>("");
  const [idError, setIdError] = useState(false);
  const [fieldError, setFieldError] = useState(false);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  function reset() {
    setComponentType("");
    setWidgetType("");
    setTitle("");
    setIdError(false);
  }

  function checkStates() {
    setIdError(false);
    setFieldError(false);
    let validId = true;
    let validField = true;
    if (title === "") {
      setIdError(true);
      validId = false;
    }
    if (componentType === "" || widgetType === "") {
      setFieldError(true);
      validField = false;
    }
    return validId && validField;
  }

  const onAddComponent = async () => {
    if (checkStates()) {
      const nextOrder = getNextComponentOrder(zone);
      const newComponent = await upsertNewComponent(
        dataSource,
        boardDataSource,
        zone.type!,
        title,
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
        baseUrl: dataSource.getBaseUrl(),
        apiPrefix: dataSource.getApiPrefix(),
        filter: { and_: {} },
        title: title,
        objectType: zone.type,
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
      type="success"
      onClick={onAddComponent}
      icon="plus"
      position="right"
      testid="confirm-add-component-button"
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
          Select Component <span className="tol-danger-colour">*</span>
        </h6>
        <Row>
          {componentOptions.map((option, index) => {
            return (
              <Col lg={4} md={4} sm={12} className="tol-button-col" key={index}>
                {!option.disabled ? (
                  <div
                    className={
                      componentType !== option.type
                        ? "tol-component-modal-btn"
                        : "tol-component-modal-btn-clicked"
                    }
                    onClick={() => setComponentType(option.type)}
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
          Select Size <span className="tol-danger-colour">*</span>
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
        <br />
        <h6>
          Enter Title <span className="tol-danger-colour">*</span>
        </h6>
        <RSForm fluid>
          <FormTextField
            id="component-title"
            onChange={(value: any) => setTitle(value)}
            name="Board Title"
            placeholder={`Title`}
            label=""
            value={title}
          />
        </RSForm>

        {idError ? (
          <p className="tol-modal-error">Title cannot be blank</p>
        ) : null}
        {fieldError ? (
          <p className="tol-modal-error">
            Please ensure all mandatory fields are filled
          </p>
        ) : null}
      </>
    </Modal>
  );
}
