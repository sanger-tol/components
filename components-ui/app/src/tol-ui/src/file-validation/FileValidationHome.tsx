/*
 * SPDX-FileCopyrightText: 2026 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */
import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Toggle } from "rsuite";
import {
  Button,
  createValidationActions,
  FileValidationUploadAndResults,
  getUserFromLocalStorage,
  IAllValidationData,
  IDropdownButtonConfig,
  IValidationConfig,
  normaliseCaps,
  PIPELINE_DS,
  RemoteTable,
  splitS3FilenameString,
  SubmissionMutateModal,
  Tabs,
  TsDataSource,
  useValidationPolicyModule,
  useZone,
  ValidationReport,
  VALIDATIONS,
  Widgets,
} from "..";

import type { TFileValidationPolicyModule } from "..";

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
  policyModule?: TFileValidationPolicyModule;
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
  const [selectedRows, setSelectedRows] = useState<string[] | { id: string }[]>(
    [],
  );

  // Capture validation to be used with modals, if the action isn't coming from tables
  const [validationData, setValidationData] =
    useState<IAllValidationData | null>(null);

  // Update table on table tab selection
  const [forceTableUpdate, setForceTableUpdate] = useState<boolean>(false);

  // toggles hidden uploads on table
  const [showHiddenUploads, setShowHiddenUploads] = useState<boolean>(false);

  // Modals state
  const [reportOpen, setReportOpen] = useState<boolean>(false);
  const [submissionMutateModalOpen, setSubmissionMutateModalOpen] =
    useState<boolean>(false);

  // Current Action ID
  const [currentActionId, setCurrentActionId] = useState<string>("");

  const [refetchFn, setRefetchFn] = useState<(() => void) | null>(null);

  const userIsAdmin = getUserFromLocalStorage().roles.includes("admin");

  // Define the zone with the default filter of hidden: false
  const uploadsZone = useZone({
    objectType: VALIDATIONS.UPLOAD,
    dataSource: new TsDataSource({
      apiPath: "/api/v1/local",
    }),
    filter: {
      and_: {
        hidden: { eq: { value: showHiddenUploads } },
      },
    },
    components: [
      {
        id: "validation-uploads-table",
      },
    ],
  });

  // update the zone filter on showHiddenUploads boolean change
  useEffect(() => {
    uploadsZone.zone.filter = {
      and_: {
        hidden: { eq: { value: showHiddenUploads } },
      },
    };
    uploadsZone.setZone({ ...uploadsZone.zone });
  }, [showHiddenUploads]);

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

  // Create an easy to access 'view upload' button, which pushes to
  // /manifest-validation/result/<uploadId> url
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
  // This is done on the API.
  const AllValidationUploadsTable = (
    <RemoteTable
      id="validation-uploads-table"
      height={500}
      actions={
        createValidationActions(
          actions,
          policies,
          PIPELINE_DS,
          {
            setReportOpen,
            setSubmissionMutateModalOpen,
            setForceTableUpdate,
            setSelectedRows,
          },
          setCurrentActionId,
        ) as IDropdownButtonConfig[]
      }
      noConfigModal
      defaultSortByAttribute="id"
      defaultSortByType="desc"
      rowSelection
      forceUpdate={forceTableUpdate}
      selectedRows={selectedRows as string[]}
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
          ...(userIsAdmin
            ? {
                "user.oidc_id": {
                  rename: "User",
                },
              }
            : null),
          s3_filename: {
            rename: "File Name",
            cellRenderer: {
              type: "fileNameSplit",
              props: { fileName: "${s3_filename}" },
            },
            width: 250,
          },
          upload_name: {
            rename: "Submission Name",
            width: 220,
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
            rename: "Validation Status",
            width: 200,
            cellRenderer: {
              type: "validationStatus",
              props: { validationStatus: "${validation_status}" },
            },
          },
          hidden: {
            filter: "bool",
            rename: "Hidden From View",
            cellRenderer: {
              type: "boolean",
            },
          },
          ...additionalTableConfig?.fields,
        },
        order: {
          active: [
            "id",
            "upload_name",
            "s3_filename",
            // Return an OIDC ID column only if the user is an admin
            ...(userIsAdmin ? ["user.oidc_id"] : []),
            "validation_status",
            "pipeline.name",
            "date_started",
            "flow_run_id",
            "failure_message",
            ...additionalTableConfig?.order,
            "hidden",
          ],
        },
      }}
      {...uploadsZone}
    />
  );

  // Tabs to separate file uploader from previous validations table
  const PageTabs = (
    <Tabs defaultActiveKey={tabParams ?? "1"}>
      <Tabs.Tab eventKey="1" title={tabTitles.titleOne}>
        <Widgets
          components={[
            { component: <>{intro}</>, type: "full" },
            {
              component: (
                <FileValidationUploadAndResults
                  setReportOpen={setReportOpen}
                  setSubmissionMutateModalOpen={setSubmissionMutateModalOpen}
                  setCurrentActionId={setCurrentActionId}
                  setValidationData={setValidationData}
                  validationConfig={validationConfig}
                  pageTitle="Manifest Validation Portal"
                  setRefetchFn={setRefetchFn}
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
            {
              component: (
                <div className="tol-file-validation-home-header-bar">
                  <h2>{tabTitles.titleTwo}</h2>
                  <div className="tol-file-validation-home-header-bar-toggle">
                    <p>Show Hidden Uploads</p>
                    <Toggle
                      onChange={() => {
                        // Force update table to use updated zone filter set in the useEffect
                        setShowHiddenUploads((prev: boolean) => !prev);
                        setForceTableUpdate((prev: boolean) => !prev);
                      }}
                      checked={showHiddenUploads}
                    />
                  </div>
                </div>
              ),
              type: "full",
            },
            { component: AllValidationUploadsTable, type: "full" },
          ]}
        />
      </Tabs.Tab>
    </Tabs>
  );

  return (
    <>
      <ValidationReport
        data={
          selectedRows.length > 0
            ? selectedRows.flatMap((row: any) => {
                return { id: Object.keys(row)[0] };
              })
            : validationData
              ? [validationData]
              : []
        }
        open={reportOpen}
        setOpen={setReportOpen}
      />
      <SubmissionMutateModal
        open={submissionMutateModalOpen}
        setOpen={setSubmissionMutateModalOpen}
        uploadIds={
          selectedRows.length > 0
            ? selectedRows.flatMap((row: any) => {
                return { id: Object.keys(row)[0] };
              })
            : validationData
              ? [validationData]
              : []
        }
        attribute={
          currentActionId === "reject" ? "rejection_reason" : "upload_name"
        }
        setForceTableUpdate={setForceTableUpdate}
        setSelectedRows={setSelectedRows}
        onSuccess={() => {
          if (validationData && refetchFn) {
            refetchFn();
          } else {
            setForceTableUpdate((prev: boolean) => !prev);
          }
        }}
      />
      {PageTabs}
    </>
  );
}
