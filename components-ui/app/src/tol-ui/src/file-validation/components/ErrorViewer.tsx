/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";

import {
  Modal,
  Button,
  truncateString,
  ValidationIcon,
  capitaliseFirstLetter,
} from "../..";

import type { ICellId } from "../..";

export interface PErrorViewer {
  /**
   * Key associated with the component
   */
  key?: string;
  /**
   * Id associated with the component
   */
  id?: string;
  /**
   * Warning or error (used for CSS)
   */
  errorType?: string;
  /**
   * The error/warning message
   */
  message?: string;
  /**
   * The step associated with the error message
   */
  stepName?: string;
  /**
   * Row ID & Column ID
   */
  cellId: ICellId;
  /**
   * Whether to truncate the error/warning message
   */
  truncate?: boolean;
}

export function ErrorViewer(props: PErrorViewer) {
  const { id, errorType, message, stepName, cellId, truncate = false } = props;

  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen((prev: boolean) => !prev);
  };

  const ModalContent = (
    <>
      <div className="tol-file-uploader-validate-step-error-modal-header">
        <h4>{stepName}</h4>
        <ValidationIcon
          iconType={errorType === "error" ? "xmark" : "exclamation"}
          size="lg"
          className={`tol-file-uploader-validate-step-icon 
            tol-file-uploader-validate-step-error-modal-icon ${errorType}`}
        />
      </div>
      <div className="tol-file-uploader-validate-step-error-modal-content">
        <p>Type: {capitaliseFirstLetter(errorType || "unknown")}</p>
        <p>Message: {message}</p>
        <p>Row: {cellId.row}</p>
        <p>Column(s): {cellId.column}</p>
      </div>
    </>
  );

  const ErrorModal = (
    <Modal
      open={isOpen}
      setOpen={setIsOpen}
      size="sm"
      children={ModalContent}
      closeButton={false}
      actionButton={
        <Button type="primary" text="Close" onClick={handleClick} />
      }
    />
  );

  return (
    <>
      {ErrorModal}
      <div
        key={id}
        className={`tol-file-uploader-validate-step-single-error-container ${errorType}`}
        onClick={handleClick}
      >
        <div className="tol-file-uploader-validate-step-single-error-inner-container">
          <ValidationIcon
            iconType={errorType === "error" ? "xmark" : "exclamation"}
            size="sm"
            className="tol-file-uploader-validate-step-single-error-icon"
          />
          <span>
            {truncate
              ? truncateString(`Row ${cellId.row}: ${message}`, 30)
              : `Row ${cellId.row}: ${message}`}
          </span>
        </div>
      </div>
    </>
  );
}
