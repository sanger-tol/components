/*
 * SPDX-FileCopyrightText: 2026 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */
import React, { useState, useEffect, useRef } from "react";
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

export interface PFileValidationHome {
  /**
   * The configuration for the file validation app, including API endpoints and other config values.
   */
  validationConfig: IValidationConfig;
  /**
   * Optional An intro component containing additional information pertinent to that specific app.
   */
  intro?: React.ReactNode;
  /**
   * Optional props to allow different titles of tabs for different apps, Portal has the concept of 'manifests',
   * yet Tree of Sex will not, so having the ability to change titles is useful.
   */
  tabTitles?: { titleOne: string; titleTwo: string };
  /**
   * Optional policy module to pass down, if not passed down it will use the default one created for file validation.
   * This allows for different apps to have different policies and actions if needed.
   */
  policyModule?: TFileValidationPolicyModule;
  /**
   * Optional additional table config to be passed down to the uploads table,
   * this allows for additional fields, custom cell renderers and different column order
   * if needed for different apps using the file validation homepage.
   */
  additionalTableConfig?: { cellRenderers: any; fields: any; order: any };
}

/**
 * File validation home. This component handles the file upload component, live upload result,
 * uploads table and modals for actions, including report modals, as well as attribute mutate modal.
 */
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

  // Update table on table tab selection (will do when fixed)
  const [forceTableUpdate, setForceTableUpdate] = useState<boolean>(false);

  // toggles hidden uploads on table
  const [showHiddenUploads, setShowHiddenUploads] = useState<boolean>(false);

  // Modals state
  const [reportOpen, setReportOpen] = useState<boolean>(false);
  const [submissionMutateModalOpen, setSubmissionMutateModalOpen] =
    useState<boolean>(false);

  // Current Action ID
  const [currentActionId, setCurrentActionId] = useState<string>("");

  // Temp table update state change (will change value of key)
  const [tableKey, setTableKey] = useState<boolean>(false);

  // Captures the refetch function when using actions on the manifest validation homepage
  const refetchFnRef = useRef<(() => void) | null>(null);
  const setRefetchFn = (fn: (() => void) | null) => {
    refetchFnRef.current = fn;
  };

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
        style={{
          color: `${policies[validationStatus]?.textColor || "var(--tol-text)"}`,
        }}
      >{`${normaliseCaps(validationStatus)}`}</p>
    );
  };

  // Create an easy to access 'view upload' button, which pushes to
  // /manifest-validation/result/<uploadId> url
  const IdAndViewButtonCell = ({ dataObject }) => {
    const uploadId = dataObject?.id;

    const handleViewResults = () => {
      history.push(`/file-validation/results/${uploadId}?t=2`);
    };

    return (
      <div className="tol-file-validation-upload-table-id-cell">
        <p>{uploadId}</p>
        <Button text="View" onClick={handleViewResults} />
      </div>
    );
  };

  // Table for viewing all previous validaitons, admins can see all
  // validation uploads, normal users can only see their own.
  // This is done on the API.
  const AllValidationUploadsTable = (
    <RemoteTable
      // Temp fix - table re-renders, but for some reason data won't refresh.
      // Will need to look into this more.
      key={`uploads-table-${tableKey}`}
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
                  setForceTableUpdate={setForceTableUpdate}
                  setSelectedRows={setSelectedRows}
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
                        // Force update the table to use updated zone filter set in the useEffect
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
              ? [{ id: validationData.id }]
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
              ? [{ id: validationData.id }]
              : []
        }
        attribute={
          currentActionId === "reject" ? "rejection_reason" : "upload_name"
        }
        setSelectedRows={setSelectedRows}
        onSuccess={() => {
          setTableKey((prev: boolean) => !prev);
          if (validationData && refetchFnRef.current) {
            refetchFnRef.current();
          }
        }}
      />
      {PageTabs}
    </>
  );
}
