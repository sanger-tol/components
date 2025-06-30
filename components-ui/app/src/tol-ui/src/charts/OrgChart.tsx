/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  Button,
  Modal,
  CentreContents,
  capitaliseFirstLetter
} from "..";


export interface OrgChartDataPoint {
  title: string;
  [key: string]: any;
}

// modalKeys: Data to be shown in the modal (if nothing is provided no modal will show)
// Title will be shown in the modal header, not in the body

// boxKeys: Data to be shown in the box (title is always shown)

interface Props {
  title: string;
  data: OrgChartDataPoint[];
  modalKeys?: string[];
  boxKeys?: string[];
  subtitle?: string;
  bordered?: boolean;
  toggleButton?: boolean;
  hiddenByDefault?: boolean;
  className?: string;
}

export function OrgChart(props: Props) {
  const {
    title,
    data,
    modalKeys,
    boxKeys,
    subtitle,
    bordered = false,
    toggleButton = true,
  } = props;

  const orgChartSize = () => {
    if (data.length <= 2) {
      return "xs";
    } else if (data.length <= 4) {
      return "sm";
    } else if (data.length <= 6) {
      return "md";
    } else if (data.length <= 8) {
      return "lg";
    } else {
      return "xl";
    }
  };

  const hiddenByDefault = !toggleButton
    ? false
    : (props.hiddenByDefault ?? true);

  const [isCollapsed, setIsCollapsed] = useState(hiddenByDefault);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleModalOpen = (dataPoint: OrgChartDataPoint) => {
    if (modalKeys) {
      setModalData(
        Object.fromEntries(modalKeys.map((key) => [key, dataPoint[key]]))
      );
      setModalOpen(true);
    }
  };

  const modalHeader = (modalTitle?: string) => {
    return (
      <h4 className="tol-org-chart-modal-header">{modalTitle ?? "Details:"}</h4>
    );
  };

  const modalBody = (
    <div>
      {modalData &&
        modalKeys
          ?.filter((key) => key !== "title")
          .map((key: string, index: number) => (
            <div key={index} className="tol-org-chart-modal-row">
              <strong>
                {`${modalData[key] && capitaliseFirstLetter(key) + ": "}`}
              </strong>
              {modalData[key] ?? ""}
            </div>
          ))}
    </div>
  );

  const detailModal = (
    <Modal
      open={modalOpen}
      setOpen={setModalOpen}
      size="sm"
      header={modalHeader(modalData?.title)}
      children={modalBody}
    />
  );

  return (
    <CentreContents>
      <div className={`tol-org-chart ${props.className} ${orgChartSize()}`}>
        {detailModal}
        <div
          className={`tol-org-chart-title ${toggleButton ? "button" : ""}`}
          onClick={() => toggleCollapse()}
        >
          {title}
          {toggleButton && (
            <Button
              onClick={() => toggleCollapse()}
              className="tol-org-chart-show-hide-button"
              icon={!isCollapsed ? "chevron-up" : "chevron-down"}
              tooltip={!isCollapsed ? "Hide" : "Show"}
            />
          )}
        </div>
        <div>
          {subtitle && !isCollapsed && (
            <div className="tol-org-chart-subtitle">{subtitle}</div>
          )}
        </div>
        <div
          className={`tol-org-chart-content-container ${
            isCollapsed ? "collapsed" : ""
          }`}
        >
          <div className="tol-org-chart-line-vertical"></div>
          <div className="tol-org-chart-connector"></div>
          <div className="tol-org-chart-data">
            {data.map((dataPoint: OrgChartDataPoint, index: number) => (
              <div key={index} onClick={() => handleModalOpen(dataPoint)}>
                <div className="tol-org-chart-connector-vertical"></div>
                <div
                  className={`tol-org-chart-box ${bordered ? "bordered" : ""}`}
                >
                  <div className="tol-org-chart-box-title">
                    {dataPoint.title}
                  </div>
                  {boxKeys &&
                    boxKeys
                      ?.filter((key) => key !== "title")
                      .map((key: string, index: number) => {
                        return (
                          <div key={index} className="tol-org-chart-box-body">
                            {dataPoint[key]}
                          </div>
                        );
                      })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CentreContents>
  );
}
