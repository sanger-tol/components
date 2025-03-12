/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Button, InfoTooltip, Modal } from "../index";

interface Props {
  showIdExportModal: boolean;
  setShowIdExportModal: any;
  setLoading: any;
  setIdsForExport: any;
  setIdsWithReqNotMet: any;
  idsForExport: string[];
  idsWithReqNotMet: any;
  completeAction: any;
  currentActionName: string;
}

function ActionCheckModal(props: Props) {
  const {
    showIdExportModal,
    setShowIdExportModal,
    setLoading,
    setIdsForExport,
    setIdsWithReqNotMet,
    idsForExport,
    idsWithReqNotMet,
    completeAction,
    currentActionName,
  } = props;

  const [deletingItem, setDeletingItem] = useState<string>("");

  const handleModalClose = () => {
    setShowIdExportModal(false);
    setLoading(false);
  };

  const handleItemRemoval = (id: string) => {
    setDeletingItem(id);

    setTimeout(() => {
      setIdsForExport(idsForExport.filter((item: string) => item !== id));

      const updatedFailureDetails = { ...idsWithReqNotMet._failureDetails };

      Object.keys(updatedFailureDetails).forEach((key) => {
        updatedFailureDetails[key] = updatedFailureDetails[key].filter(
          (itemId: string) => itemId !== id
        );
      });

      setIdsWithReqNotMet({ _failureDetails: updatedFailureDetails });

      setDeletingItem("");
    }, 500);
  };

  const handleRemoveAllIssues = () => {
    const failingIds = Object.values(
      idsWithReqNotMet._failureDetails || {}
    ).flat();

    setIdsForExport(
      idsForExport.filter((item: string) => !failingIds.includes(item))
    );
    setIdsWithReqNotMet({ _failureDetails: {} });
  };

  const handleCompleteAction = (actionName: string, ids: string[]) => {
    completeAction(actionName, ids);
    setShowIdExportModal(false);
    setIdsForExport([]);
    setIdsWithReqNotMet([]);
  };

  const failingIdsCount = new Set(Object.values(idsWithReqNotMet._failureDetails || {}).flat()).size;

  const exportItem = (id: string) => {
    const isFailingItem = Object.values(idsWithReqNotMet._failureDetails || {})
      .flat()
      .includes(id);

    const failureReasons = idsWithReqNotMet._failureDetails
      ? Object.entries(idsWithReqNotMet._failureDetails)
          .filter(([_, ids]) => (ids as string[]).includes(id))
          .map(([requirement]) => requirement)
      : [];

    const tooltipContent =
      failureReasons.length > 0
        ? `Failed Requirements: ${failureReasons.join(", ")}`
        : "Could not get reasons for failure.";

    return (
      <div
        key={id}
        className={`tol-table-action-modal-export-item-container ${deletingItem === id ? "deleting" : ""}`}
      >
        <div
          className={`tol-table-action-modal-export-item ${
            isFailingItem ? "error" : ""
          }`}
        >
          <p>{id}</p>
          {isFailingItem && <InfoTooltip contents={tooltipContent} />}
        </div>
        {isFailingItem && (
          <Button
            type="error"
            onClick={() => {
              handleItemRemoval(id);
            }}
            icon={"xmark"}
            tooltip="Remove"
            className="tol-table-action-modal-export-item-remove-btn"
          />
        )}
      </div>
    );
  };

  const modalActionButtons = (
    <div className="tol-table-action-modal-btns">
      <div className="tol-table-actions-modal-remove-all-btn-container">
        <Button
          type="primary"
          onClick={() => handleRemoveAllIssues()}
          text="Remove All Issues"
          disabled={failingIdsCount === 0}
          className="tol-table-action-modal-close-btn"
        />
        {failingIdsCount === 0 && (
          <p className="tol-table-actions-modal-ready-indicator">
            Action Ready
          </p>
        )}
      </div>
      <div style={{ display: "flex" }}>
        <Button
          type="success"
          onClick={() => handleCompleteAction(currentActionName, idsForExport)}
          disabled={failingIdsCount > 0}
          text="Complete Action"
          className="tol-table-action-modal-success-btn"
        />
        <Button type="error" onClick={() => handleModalClose()} text="Cancel" />
      </div>
    </div>
  );

  const idCheckModalHeader = <h4>Some of your items cannot be actioned:</h4>;

  const idCheckModalBody = (
    <div className="tol-table-action-modal-body-container">
      <p>
        This is because they don't meet the criteria for actioning, please check
        and try again. You can also remove them from the list of items to be
        actioned.
      </p>
      <h6>
        {`${idsForExport.length} items to be actioned; ${failingIdsCount} issues ${" "}
        ${failingIdsCount > 0 ? "highlighted" : "detected"}:`}
      </h6>
      <div className="tol-table-action-modal-export-item-list-container">
        {idsForExport.map((id: string) => exportItem(id))}
      </div>
      {modalActionButtons}
    </div>
  );

  return (
    <div>
      <Modal
        open={showIdExportModal}
        setOpen={setShowIdExportModal}
        size={"sm"}
        children={idCheckModalBody}
        closeButton={false}
        header={idCheckModalHeader}
        onExited={() => setLoading(false)}
      />
    </div>
  );
}

export default ActionCheckModal;
