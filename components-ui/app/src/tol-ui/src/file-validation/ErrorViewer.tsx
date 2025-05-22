/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { createTextGeneratorFactory, Modal } from "../index";
import ValidationIcon from "./ValidationIcon";

interface Props {
  id?: string;
  message?: string;
  stepName?: string;
}

function ErrorViewer(props: Props) {
  const words = createTextGeneratorFactory();
  const { id, message = words.generateSentences(2), stepName } = props;

  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(true);
  };

  const ModalContent = (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "15px 5px",
          alignItems: "center",
        }}
      >
        <h4>{stepName}</h4>
        <ValidationIcon
          iconType="xmark"
          size="lg"
          style={{
            backgroundColor: "var(--tol-danger)",
            margin: "0px 0px 10px 0px",
          }}
          className="tol-file-uploader-validate-step-icon"
        />
      </div>
      <p style={{margin: "8px 5px"}}>{message}</p>
    </div>
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
        style={{
          width: "100%",
          padding: "5px",
          background: "var(--tol-danger)",
          color: "white",
          borderRadius: "6px",
          margin: "8px 0px 5px 0px",
          maxHeight: "30px",
          display: "flex",
          justifyContent: "center",
          overflow: "hidden",
          cursor: "pointer",
        }}
        onClick={handleClick}
      >
        <div style={{ display: "flex", gap: "8px", width: "100%" }}>
          <ValidationIcon
            iconType="xmark"
            size="sm"
            style={{ padding: "4px" }}
          />
          <p
            style={{
              margin: "-2px 2px 0 0",
              maxHeight: "30px",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {message}
          </p>
        </div>
      </div>
    </>
  );
}

export default ErrorViewer;
