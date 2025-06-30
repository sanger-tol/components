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
  TsDataSource,
  FormTextField,
  RSForm,
  addComponent,
  defineComponent,
  IZone,
  componentOptions,
  sizeOptions
} from "../../index";


interface Props {
  open: boolean;
  setOpen: any;
  zone: IZone;
  setZone: any;
  zoneId: string;
  currentWidgets: any;
  setCurrentWidgets: any;
  dataSource: TsDataSource;
  boardsDataSource: TsDataSource;
}

export function ComponentPickerModal(props: Props) {
  const {
    open,
    setOpen,
    zone,
    setZone,
    zoneId,
    currentWidgets,
    setCurrentWidgets,
    dataSource,
    boardsDataSource,
  } = props;
  const [componentType, setComponentType] = useState("");
  const [widgetType, setWidgetType] = useState("");
  const [title, setTitle] = useState<string>("");
  const [idError, setIdError] = useState(false);
  const [fieldError, setFieldError] = useState(false);

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

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  const onAddComponent = async () => {
    if (checkStates()) {
      const highestOrder = Object.values(zone.components).reduce(
        (max, component) => {
          return component.data.order! > max ? component.data.order : max;
        },
        0,
      );
      const nextOrder = highestOrder! + 1;
      // all components added are set with portal as baseUrl
      const newComponent = await addComponent(
        dataSource,
        boardsDataSource,
        zone.type!,
        title,
        nextOrder,
        componentType,
        widgetType,
        zoneId,
      );
      // this adds the component to the zone
      defineComponent(
        {
          id: newComponent.newComponentId,
          size: widgetType,
          type: componentType,
          order: nextOrder,
        },
        zone,
      );
      zone.order = [...zone.order, newComponent.newComponentId];
      // this adds the component to the currentWidgets to be rendered
      setCurrentWidgets([
        ...currentWidgets,
        {
          componentId: newComponent.newComponentId,
          order: nextOrder,
          componentZoneId: newComponent.newComponentZoneId,
          baseUrl: dataSource.getBaseUrl(),
          apiPrefix: dataSource.getApiPrefix(),
          componentType: componentType,
          filter: { and_: {} },
          title: title,
          objectType: zone.type,
          config: {},
          widgetType: widgetType,
          filterPassThrough: false,
        },
      ]);

      setZone({ ...zone });
      reset();
      setOpen(false);
    }
  };

  const plusButton = (
    <Button
      type="success"
      onClick={onAddComponent}
      icon="plus"
      position="right"
    />
  );

  return (
    <Modal
      open={open}
      size="md"
      setOpen={setOpen}
      actionButton={plusButton}
      overflow={false}
      className={"dashboard-component-modal-full"}
    >
      <>
        <h6>
          Select Component <span style={{ color: "red" }}>*</span>
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
          Select Size <span style={{ color: "red" }}>*</span>
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
          Enter Title <span style={{ color: "red" }}>*</span>
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
