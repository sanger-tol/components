/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Toggle } from "rsuite";
import {
  Widgets,
  Dropzone,
  PopUpMessage,
  Button,
  DropdownButtons,
  Modal,
} from "../tol-ui/src";

interface IValidationConfig {
  s3_url: string;
  pipeline: string;
  destination: string;
}

interface Props {
  endpoint: string;
  validationConfig: IValidationConfig;
  fileType?: string;
  pageTitle?: string;
}

const DEFAULT_FILE_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel";

function FileValidation(props: Props) {
  const {
    endpoint,
    validationConfig,
    pageTitle = "File Validation",
    fileType = DEFAULT_FILE_TYPE,
  } = props;

  const [validateAndUpload, setValidateAndUpload] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<string | boolean>(false);

  const generateMessages = (apiRes: any) => {
    return [];
  };

  const TitleBar = (
    <div style={{ display: "flex" }}>
      <h2>{pageTitle}</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          flexGrow: 1,
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Button
          type="primary"
          text={`${validateAndUpload ? "Validate and Upload" : "Validate File  "}`}
        />
        <DropdownButtons
          mainButtonIcon={{ icon: "bars" }}
          placement="leftStart"
          menuStyle={{ marginRight: "5px" }}
          dropdownButtons={[
            {
              name: "Previous Uploads",
              action: () => {
                setOpenModal("results");
              },
            },
            {
              name: "Help",
              action: () => {
                setOpenModal("help");
              },
            },
          ]}
        />
      </div>
    </div>
  );

  const FileUploader = (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          justifyContent: "flex-end",
          margin: "5px 15px 15px 0",
        }}
      >
        <p>Validate only</p>
        <Toggle
          key="validation-type-toggle"
          checked={validateAndUpload}
          onChange={() => {
            setValidateAndUpload(!validateAndUpload);
            PopUpMessage({
              type: "info",
              message: `File validation ${!validateAndUpload ? "and upload enabled" : "only enabled"}.`,
            });
          }}
        />
        <p>Validate and upload</p>
      </div>
      <Dropzone
        endpoint={endpoint}
        fileType={fileType}
        generateMessages={generateMessages}
      />
    </div>
  );

  const ResultsViewer = (
    <div>
      <h6>View results: </h6>
    </div>
  );

  const ResultsViewerModal = (
    <div>
      <Modal
        open={openModal === "results"}
        onClose={() => setOpenModal(null)}
        setOpen={setOpenModal}
      />
    </div>
  );

  const helpModal = (
    <div>
      <Modal
        open={openModal === "help"}
        onClose={() => setOpenModal(null)}
        setOpen={setOpenModal}
      />
    </div>
  );

  const Components = [
    {
      component: TitleBar,
      size: "xl",
    },
    {
      component: FileUploader,
      size: "full",
    },
    {
      component: ResultsViewer,
      size: "full",
    },
  ];

  return (
    <>
      {ResultsViewerModal}
      {helpModal}
      <Widgets components={Components} />
    </>
  );
}

export default FileValidation;
