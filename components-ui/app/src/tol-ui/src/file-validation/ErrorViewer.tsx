/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Modal } from "../index";
import ValidationIcon from "./ValidationIcon";

//TODO: Take into account warnings, as well as errors

interface Props {
  id?: string;
  errorType?: string;
  message?: string;
  stepName?: string;
}

function ErrorViewer(props: Props) {
  const { id, errorType, message, stepName } = props;

  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen((prev) => !prev);
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
      <p className="tol-file-uploader-validate-step-error-modal-content">
        {message}
      </p>
    </>
  );

  const ErrorModal = (
    <Modal
      open={isOpen}
      setOpen={setIsOpen}
      size="sm"
      children={ModalContent}
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
          <span>{message}</span>
        </div>
      </div>
    </>
  );
}

export default ErrorViewer;
