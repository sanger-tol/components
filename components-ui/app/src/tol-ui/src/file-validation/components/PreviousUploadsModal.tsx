/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Toggle } from "rsuite";

import {
  Icon,
  Modal,
  Button,
  TolLoader,
  PreviousUploadsView,
  getUserFromLocalStorage,
  fetchAndNormaliseAllUploadResults,
  VALIDATION_ENDPOINTS,
  BUTTON_TIMEOUT,
  PIPELINE_DS,
  useQueryData,
  FILE_VALIDATION_STATUS,
} from "../..";

import type { IAllValidationData, IFilter } from "../..";

export interface PPreviousUploadsModal {
  /**
   * Open modal state
   */
  openModal: boolean | string;
  /**
   * Open modal state setter
   */
  setOpenModal: (open: boolean | string) => void;
  /**
   * Optional callback that fires when modal opens
   */
  onEnter?: () => void;
}

export function PreviousUploadsModal(props: PPreviousUploadsModal) {
  const { openModal, setOpenModal, onEnter } = props;

  const [showPassedSteps, setShowPassedSteps] = useState<boolean>(true);
  const [expandedResults, setExpandedResults] = useState<string | null>(null);
  const [showHiddenUploads, setShowHiddenUploads] = useState<boolean>(false);

  const user = getUserFromLocalStorage();
  const id = user ? user.id : null;

  // If not showHiddenUploads, then add hidden filter, otherwise don't add
  const andFilter: IFilter = {
    and_: {
      user_id: { eq: { value: id } },
      ...(!showHiddenUploads && { hidden: { eq: { value: false } } }),
    },
  };

  const fetchPreviousUploads = async () => {
    return await fetchAndNormaliseAllUploadResults(
      PIPELINE_DS,
      VALIDATION_ENDPOINTS.UPLOAD,
       andFilter,
    );
  };

  const isResultsOpen = openModal === "results";
  const isModalOpen =
    isResultsOpen || (typeof openModal === "boolean" && openModal === true);

  const userFileValidationUploads = useQueryData<IAllValidationData[]>(
    // add showHiddenUploads to the dependancy array, so it updates when the state changes
    ["userFileValidationUploads", id, showHiddenUploads],
    fetchPreviousUploads,
    {
      enabled: (openModal === "results" || openModal === true) && id !== null,
      refetchBackoff: {
        enabled: true,
        options: {
          // Check the query and return ( a. is modal open? or
          // b. are any results 'in progress'? )
          // If either are false, stop querying.
          stopCondition: (query) => {
            const data = query.state.data as IAllValidationData[] | undefined;
            const hasInProgress =
              data?.some(
                (upload) =>
                  upload.validationStatus ===
                  FILE_VALIDATION_STATUS.IN_PROGRESS,
              ) ?? false;

            return !isModalOpen || !hasInProgress;
          },
          limit: 15,
        },
      },
      staleTime: 0,
    },
  );

  const handleToggleUploadResults = (id: string) => {
    setExpandedResults(expandedResults === id ? null : id);
  };

  const ResultsModalContent = (
    <div
      className="tol-file-validation-previous-uploads-modal-container 
        tol-file-validation-scrollbar-fix"
    >
      {userFileValidationUploads.isLoading ? (
        <TolLoader
          size="md"
          content="Loading..."
          vertical
          className="tol-file-validation-loader-style"
        />
      ) : userFileValidationUploads.isError || !id ? (
        <div className="tol-file-validation-error-info">
          <span className="tol-file-validation-error-icon">
            <Icon icon="info" size="lg" />
          </span>
          <h6>
            {!id
              ? "User ID not found. Please log in to view."
              : "Error loading uploads."}
          </h6>
        </div>
      ) : userFileValidationUploads.data.length > 0 ? (
        userFileValidationUploads.data
          // Sort newest to oldest via id (might cause issues with a revalidated upload)
          .sort(
            (a: IAllValidationData, b: IAllValidationData) =>
              Number(b.id) - Number(a.id),
          )
          .map((upload: IAllValidationData, index: number) => {
            return (
              <div
                key={`${upload.id}-${userFileValidationUploads.dataUpdatedAt}-${index}`}
                className="tol-file-validation-previous-uploads-inner-container"
              >
                <PreviousUploadsView
                  data={upload}
                  id={upload.id}
                  expanded={expandedResults === upload.id}
                  onToggle={handleToggleUploadResults}
                  showPassedSteps={showPassedSteps}
                  completed={upload.completed}
                  setOpenModal={setOpenModal}
                />
              </div>
            );
          })
      ) : (
        <div className="tol-file-validation-error-info">
          <span className="tol-file-validation-error-icon">
            <Icon icon="info" size="lg" />
          </span>
          <h6>No previous uploads found.</h6>
        </div>
      )}
    </div>
  );

  const ResultsModalHeader = (
    <div className="tol-file-validation-previous-uploads-modal-header">
      <div className="tol-file-validation-previous-uploads-modal-header-content">
        <h3>Previous Validations</h3>
        {userFileValidationUploads.dataUpdatedAt !== 0 && (
          <p>
            Last updated at:{" "}
            {new Date(userFileValidationUploads.dataUpdatedAt).toLocaleString()}
          </p>
        )}
      </div>
      <div className="tol-file-validation-previous-uploads-modal-toggle">
        {" "}
        <p className="tol-file-validation-previous-uploads-modal-toggle-tag">
          Show Hidden Uploads
        </p>
        <Toggle
          key="hidden-uploads-toggle"
          checked={showHiddenUploads}
          onChange={() => setShowHiddenUploads((prev: boolean) => !prev)}
        />
        <p className="tol-file-validation-previous-uploads-modal-toggle-tag">
          Show passed steps
        </p>
        <Toggle
          key="passed-steps-toggle"
          checked={showPassedSteps}
          onChange={() => setShowPassedSteps((prev: boolean) => !prev)}
        />
        <div>
          <Button
            icon="rotate"
            tooltip="Refresh"
            onClick={() => userFileValidationUploads.refetch()}
            timeout={BUTTON_TIMEOUT}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Modal
        onEnter={onEnter}
        open={openModal === "results" || openModal === true}
        header={ResultsModalHeader}
        children={ResultsModalContent}
        onClose={() => setOpenModal(false)}
        setOpen={setOpenModal}
        onExited={() => setExpandedResults(null)}
      />
    </div>
  );
}
