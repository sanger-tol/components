/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  Button,
  Modal,
  Row,
  Col,
  Icon,
  HoverOverlay,
  IZone,
  componentOptions,
  sizeOptions,
  PBoard,
  RequiredAsterisk,
  BUTTONS,
  BOARD_ENTITIES,
  IComponent,
  addBoardEntityInParentState,
  postAddBoardEntity,
  TsDataSource,
} from "../..";


export interface PComponentCreationModal extends PBoard {
  open: boolean;
  setOpen: (open: boolean) => void;
  zone: IZone;
  setZone: (zone: IZone) => void;
  boardDataSource: TsDataSource;
}

export function ComponentCreationModal(props: PComponentCreationModal) {
  const {
    open,
    setOpen,
    zone,
    setZone,
    boardDataSource,
  } = props;
  const [componentType, setComponentType] = useState("");
  const [widgetType, setWidgetType] = useState("");

  const reset = () => {
    setComponentType("");
    setWidgetType("");
    setOpen(false);
  }

  const onAddComponent = async () => {
    postAddBoardEntity(
      boardDataSource,
      zone.id!,
      {
        object_type: zone.object_type,
        data_source_instance_id: zone.data_source_instance_id,
        widget_type: widgetType,
        component_type: componentType,
        config: {}, // TODO: remove with endpoint support
        filter_pass_through: false, // TODO: remove with endpoint support
      }
    )
      .then((res) => {
        const component = res.data;
        const z = addBoardEntityInParentState<IComponent, IZone>(
          BOARD_ENTITIES.ENTITIES.COMPONENT,
          component,
          zone
        )
        setZone({ ...z });
        reset();
      })
  };

  const PlusButton = (
    <Button
      {...BUTTONS.CONFIRM}
      onClick={onAddComponent}
      testid="confirm-add-component-button"
      disabled={componentType === "" || widgetType === ""}
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
        <h4>Add New Component</h4>
        <p>
          Select Component <RequiredAsterisk />
        </p>
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
        <p>
          Select Size <RequiredAsterisk />
        </p>
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
