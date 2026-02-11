/*
 * SPDX-FileCopyrightText: 2026 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */
import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  Button,
  createValidationActions,
  FileValidationUploadAndResults,
  getUserFromLocalStorage,
  IDropdownButtonConfig,
  ITableRecord,
  IValidationConfig,
  normaliseCaps,
  PIPELINE_DS,
  RemoteTable,
  splitS3FilenameString,
  SubmissionRejectModal,
  Tabs,
  TsDataSource,
  useValidationPolicyModule,
  useZone,
  ValidationReport,
  Widgets,
} from "..";

import type { TValidationPolicyModule } from "@tol/tol-ui";

/**
 * This component handles the file upload component, live upload result, uploads table
 * and modals for actions, namely: file rejection modal & report modal
 */

export interface PFileValidationHome {
  validationConfig: IValidationConfig;
  /**
   * An intro component containing additional information pertinent to that specific app.
   */
  intro?: React.ReactNode;
  /**
   * Props to allow different titles of tabs for different apps, Portal has the concept of 'manifests',
   * yet Tree of Sex will not, so having the ability to change titles is useful.
   */
  tabTitles?: { titleOne: string; titleTwo: string };
  policyModule?: TValidationPolicyModule;
  additionalTableConfig?: { cellRenderers: any; fields: any; order: any };
}

export function FileValidationHome(props: PFileValidationHome) {
  const {
    validationConfig,
    intro = "Welcome to the Validation Portal.",
    tabTitles = {
      titleOne: "Manifest Validation",
      titleTwo: "Uploaded Manifests",
    },
    policyModule = useValidationPolicyModule(),
    additionalTableConfig = {
      cellRenderers: {},
      fields: {},
      order: [],
    },
  } = props;

  const history = useHistory();

  // get the 't' - tab query param if present in URL
  // to return a user back to the specified tab
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParams = queryParams.get("t");

  // Get status policy and all available actions
  const { actions, policies } = policyModule;

  // Capture Row IDs on selection to be used with modals
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Update table on table tab selection
  const [forceTableUpdate, setForceTableUpdate] = useState<boolean>(false);

  // Modals state
  const [reportOpen, setReportOpen] = useState<boolean>(false);
  const [submissionRejectModalOpen, setSubmissionRejectModalOpen] =
    useState<boolean>(false);

  const userIsAdmin = getUserFromLocalStorage().roles.includes("admin");

  // Remove the env identifier and random id from file name
  const FileNameSplitCell = ({ fileName }) => {
    return <p>{splitS3FilenameString(fileName)}</p>;
  };

  // Easy to read validation status component
  const ValidationStatusCell = ({ validationStatus }) => {
    return (
      <p
        style={{ color: `${policies[validationStatus].textColor}` }}
      >{`${normaliseCaps(validationStatus)}`}</p>
    );
  };

  // Create an easy to access 'view' button, which pushes
  // /manifest-validation/result/<id> url
  const IdAndViewButtonCell = ({ dataObject }) => {
    const id = dataObject?.id;

    const handleViewResults = () => {
      history.push(`/file-validation/results/${id}?t=2`);
    };

    return (
      <div className="tol-file-validation-upload-table-id-cell">
        <p>{id}</p>
        <Button text="View" onClick={handleViewResults} />
      </div>
    );
  };

  // Table for viewing all previous validaitons, admins can see all
  // validation uploads, normal users can only see their own.
  const AllValidationUploadsTable = (
    <RemoteTable
      id="uploads-table"
      height={500}
      actions={
        createValidationActions(actions, policies, PIPELINE_DS, {
          setReportOpen,
          setSubmissionRejectModalOpen,
          setForceTableUpdate,
        }) as IDropdownButtonConfig[]
      }
      noConfigModal
      defaultSortByAttribute="id"
      defaultSortByType="desc"
      rowSelection
      forceUpdate={forceTableUpdate}
      selectedRows={selectedRows}
      setSelectedRows={setSelectedRows}
      noActionsFooter
      cellRenderers={{
        fileNameSplit: FileNameSplitCell,
        idAndViewButton: IdAndViewButtonCell,
        validationStatus: ValidationStatusCell,
        ...additionalTableConfig?.cellRenderers,
      }}
      fields={{
        data: {
          id: {
            rename: "Manifest ID",
            width: 130,
            cellRenderer: {
              type: "idAndViewButton",
            },
          },
          // Return an OIDC column only if the user is an admin
          ...(userIsAdmin
            ? {
                "user.oidc_id": {
                  rename: "User",
                },
              }
            : null),
          s3_filename: {
            rename: "Manifest Name",
            cellRenderer: {
              type: "fileNameSplit",
              props: { fileName: "${s3_filename}" },
            },
            width: 250,
          },
          "pipeline.name": {
            rename: "Pipeline",
            width: 190,
          },
          date_started: {
            rename: "Upload Date",
            cellRenderer: { type: "datetime" },
            width: 180,
          },
          failure_message: { rename: "System Failure Reason", width: 180 },
          flow_run_id: {
            rename: "Flow Run ID",
          },
          validation_status: {
            rename: "Manifest Status",
            width: 200,
            cellRenderer: {
              type: "validationStatus",
              props: { validationStatus: "${validation_status}" },
            },
          },
          ...additionalTableConfig?.fields,
        },
        order: {
          active: [
            "id",
            "s3_filename",
            ...(userIsAdmin ? ["user.oidc_id"] : []),
            "pipeline.name",
            "date_started",
            "validation_status",
            "flow_run_id",
            "failure_message",
            ...additionalTableConfig?.order,
          ],
        },
      }}
      {...useZone({
        objectType: "upload",
        dataSource: new TsDataSource({
          apiPath: "/api/v1/local",
        }),
        components: [
          {
            id: "uploads-table",
          },
        ],
      })}
    />
  );

  // Tabs to separate file uploader from previous validations table
  const PageTabs = (
    <Tabs defaultActiveKey={tabParams ?? "1"}>
      <Tabs.Tab eventKey="1" title={tabTitles.titleOne}>
        <Widgets
          components={[
            {
              component: (
                <FileValidationUploadAndResults
                  validationConfig={validationConfig}
                  pageTitle="Manifest Validation Portal"
                />
              ),
              type: "full",
            },
          ]}
        />
      </Tabs.Tab>
      <Tabs.Tab
        eventKey="2"
        title={
          // Force update the table when a user has clicked the table tab before
          // uploading a new manifest (if we don't do this, it will always be one upload behind).
          <span
            onClick={() => {
              setForceTableUpdate((prev: boolean) => !prev);
            }}
          >
            {tabTitles.titleTwo}
          </span>
        }
      >
        <Widgets
          components={[
            { component: intro, type: "full" },
            { component: <h2>{tabTitles.titleTwo}</h2>, type: "full" },
            { component: AllValidationUploadsTable, type: "full" },
          ]}
        />
      </Tabs.Tab>
    </Tabs>
  );

  return (
    <>
      <ValidationReport
        data={[]}
        open={reportOpen}
        setOpen={setReportOpen}
        uploadStatus={""}
      />
      <SubmissionRejectModal
        open={submissionRejectModalOpen}
        setOpen={setSubmissionRejectModalOpen}
        uploadIds={selectedRows.flatMap((row: ITableRecord) => {
          return Object.keys(row);
        })}
        setForceTableUpdate={setForceTableUpdate}
      />
      {PageTabs}
    </>
  );
}
