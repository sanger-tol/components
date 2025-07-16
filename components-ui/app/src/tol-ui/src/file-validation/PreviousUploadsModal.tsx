/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Toggle } from "rsuite";
import { useQuery } from "@tanstack/react-query";
import { Button, Icon, Modal, TolLoader, TsDataSource } from "../index";
import {
  fetchAndNormaliseAllUploadResults,
  IPipelineUpload,
  PreviousUploadsView,
  REFRESH_INTERVAL,
  TOL_LOADER_STYLES,
} from "./index";
import { VALIDATION_ENDPOINTS } from "../constants";
import { getUserFromLocalStorage } from "../services/localStorage/localStorageService";

interface Props {
  openModal: boolean | string;
  setOpenModal: (open: boolean | string) => void;
}

function PreviousUploadsModal(props: Props) {
  const { openModal, setOpenModal } = props;

  const [showPassedSteps, setShowPassedSteps] = useState<boolean>(true);
  const [expandedResults, setExpandedResults] = useState<string | null>(null);

  const { id } = getUserFromLocalStorage();
  const ds = new TsDataSource();

  const fetchPreviousUploads = async () => {
    const cacheBustedEndpoint = `${
      VALIDATION_ENDPOINTS.UPLOAD
    }?_cache_bust=${Date.now()}`;
    return await fetchAndNormaliseAllUploadResults(ds, cacheBustedEndpoint, id);
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
    enabled: openModal === "results" || openModal === true,
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
      ) : isError ? (
        <div className="tol-file-validation-error-info">
          <span className="tol-file-validation-error-icon">
            <Icon icon="info" size="lg" />
          </span>
          <h6>Error loading uploads.</h6>
        </div>
      ) : userFileValidationUploadsData.length > 0 ? (
        userFileValidationUploadsData
          .sort((a, b) => Number(b.id) - Number(a.id))
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
            timeout={3000}
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

export default PreviousUploadsModal;
