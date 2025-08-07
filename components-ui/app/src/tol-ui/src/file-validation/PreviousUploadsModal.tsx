/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Toggle } from "rsuite";
import { useQuery } from "@tanstack/react-query";
import {
  Icon,
  Modal,
  Button,
  TolLoader,
  PreviousUploadsView,
  getUserFromLocalStorage,
  fetchAndNormaliseAllUploadResults,
  IPipelineUpload,
  REFRESH_INTERVAL,
  TOL_LOADER_STYLES,
  VALIDATION_ENDPOINTS,
  BUTTON_TIMEOUT,
  PIPELINE_DS
} from "..";

export interface PPreviousUploadsModal {
  openModal: boolean | string;
  setOpenModal: (open: boolean | string) => void;
}

export function PreviousUploadsModal(props: PPreviousUploadsModal) {
  const { openModal, setOpenModal } = props;

  const [showPassedSteps, setShowPassedSteps] = useState<boolean>(true);
  const [expandedResults, setExpandedResults] = useState<string | null>(null);
  const user = getUserFromLocalStorage();
  const id = user ? user.id : null;

  const fetchPreviousUploads = async () => {
    const cacheBustedEndpoint = `${
      VALIDATION_ENDPOINTS.UPLOAD
    }?_cb=${Date.now()}`;
    return await fetchAndNormaliseAllUploadResults(PIPELINE_DS, cacheBustedEndpoint, id);
  };

  const {
    data: userFileValidationUploadsData = [],
    isLoading,
    isError,
    refetch: refetchAllUploads,
    dataUpdatedAt: allUploadsUpdatedAt,
  } = useQuery({
    queryKey: ["userFileValidationUploads", id],
    queryFn: fetchPreviousUploads,
    enabled: (openModal === "results" || openModal === true) && id !== null,
    refetchInterval: openModal === "results" ? REFRESH_INTERVAL : false,
    staleTime: 0,
  });

  const handleToggleUploadResults = (id: string) => {
    setExpandedResults(expandedResults === id ? null : id);
  };

  const ResultsModalContent = (
    <div
      className="tol-file-validation-previous-uploads-modal-container 
        tol-file-validation-scrollbar-fix"
    >
      {isLoading ? (
        <TolLoader
          size="lg"
          content="Loading..."
          vertical
          styles={TOL_LOADER_STYLES}
        />
      ) : isError || !id ? (
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
      ) : userFileValidationUploadsData.length > 0 ? (
        userFileValidationUploadsData
          .sort(
            (a: IPipelineUpload, b: IPipelineUpload) =>
              Number(b.id) - Number(a.id)
          )
          .map((upload: IPipelineUpload, index: number) => {
            return (
              <div
                key={`${upload.id}-${allUploadsUpdatedAt}-${index}`}
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
        <p>Last updated at: {new Date(allUploadsUpdatedAt).toLocaleString()}</p>
      </div>
      <div className="tol-file-validation-previous-uploads-modal-toggle">
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
            onClick={() => refetchAllUploads()}
            timeout={BUTTON_TIMEOUT}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Modal
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
