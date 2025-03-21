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
} from "../../index";
import { FormTextField } from "../../forms";
import { RSForm } from "../../index";
import { IZone, addComponent, defineComponent } from "../utils";

interface Props {
  open: boolean;
  setOpen: any;
  zone: IZone;
  setZone: any;
  zoneId: string;
  ds: TsDataSource;
  currentWidgets: any;
  setCurrentWidgets: any;
  dataUrl?: string;
}

function ComponentPickerModal(props: Props) {
  const {
    open,
    setOpen,
    zone,
    setZone,
    zoneId,
    ds,
    currentWidgets,
    setCurrentWidgets,
    dataUrl,
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
      //All components added are set with portal as baseUrl
      const newComponent = await addComponent(
        ds,
        zone.type!,
        title,
        nextOrder,
        componentType,
        widgetType,
        zoneId,
        dataUrl,
      );
      //This adds the component to the zone
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
      // This adds the component to the currentWidgets to be rendered
      setCurrentWidgets([
        ...currentWidgets,
        {
          componentId: newComponent.newComponentId,
          order: nextOrder,
          componentZoneId: newComponent.newComponentZoneId,
          baseUrl: dataUrl,
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

  const componentOptions = [
    {
      type: "count",
      icon: "hashtag",
      disabled: false,
    },
    {
      type: "chart",
      icon: "chart-column",
      disabled: true,
    },
    {
      type: "sunburst",
      icon: "chart-pie",
      disabled: false,
    },
    {
      type: "table",
      icon: "table",
      disabled: false,
    },
  ];

  const sizeOptions = [
    {
      type: "sm",
      name: "Small",
      disabled: componentType === "count" || componentType == "sunburst" ? false : true,
    },
    {
      type: "md",
      name: "Medium",
      disabled: componentType === "count" ? true : false,
    },
    {
      type: "lg",
      name: "Large",
      disabled: componentType === "count" ? true : false,
    },
  ];

  return (
    <Modal
      open={open}
      size="full"
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
            const content = (
              <>
                <Icon icon={option.icon} size="6x" />
                <h6>{option.type}</h6>
              </>
            );
            return (
              <Col lg={3} md={6} sm={12} className="tol-button-col" key={index}>
                {!option.disabled ? (
                  <div
                    className={
                      componentType !== option.type
                        ? "tol-component-modal-bttn"
                        : "tol-component-modal-bttn-clicked"
                    }
                    onClick={() => setComponentType(option.type)}
                  >
                    {content}
                  </div>
                ) : (
                  <HoverOverlay contents={"Coming Soon..."}>
                    <div
                      className={"tol-component-modal-bttn-disabled"}
                      onClick={() => console.log("unavailable")}
                    >
                      {content}
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
          {sizeOptions.map((option, index) => {
            return (
              <Col lg={4} md={4} sm={12} className="tol-button-col" key={index}>
                {!option.disabled ? (
                  <div
                    className={
                      widgetType !== option.type
                        ? "tol-component-modal-bttn"
                        : "tol-component-modal-bttn-clicked"
                    }
                    onClick={() => setWidgetType(option.type)}
                  >
                    <h5>{option.name}</h5>
                  </div>
                ) : (
                  <HoverOverlay contents={"Coming Soon..."}>
                    <div
                      className={"tol-component-modal-bttn-disabled"}
                      onClick={() => console.log("unavailable")}
                    >
                      <h5>{option.name}</h5>
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

export default ComponentPickerModal;
