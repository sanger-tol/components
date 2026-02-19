/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState, Dispatch, SetStateAction } from "react";
import { Input, InputGroup } from "rsuite";
import { useQueryClient } from "@tanstack/react-query";

import {
  Modal,
  Button,
  rejectSubmission,
  PopUpMessage,
  VALIDATION_ENDPOINTS,
  fetchAndNormaliseAllUploadResults,
  PIPELINE_DS,
  getUserFromLocalStorage,
  useQueryData,
  splitS3FilenameString,
  TolLoader,
} from "../..";

import type {
  IValidationRejectionReason,
  TValidationRejectionReasons,
  IAllValidationData,
} from "../..";

export interface PSubmissionRejectModal {
  /**
   * Modal open boolean.
   */
  open: boolean;
  /**
   * Function to set modal open boolean state.
   */
  setOpen: (open: boolean) => void;
  /**
   * List of IDs of items to be rejected.
   */
  uploadIds: string[];
  /**
   * Force table update to refresh data after rejection submission
   */
  setForceTableUpdate?: Dispatch<SetStateAction<boolean>>;
  /**
   * Callback to clear the selected rows after performing a status update
   */
  setSelectedRows?: Dispatch<SetStateAction<string[]>>;
}

export function SubmissionRejectModal(props: PSubmissionRejectModal) {
  const { open, setOpen, uploadIds, setForceTableUpdate, setSelectedRows } =
    props;
  const queryClient = useQueryClient();

  const [rejectionReasons, setRejectionReasons] =
    useState<TValidationRejectionReasons>([]);

  const user = getUserFromLocalStorage();

  const fetchPipelineData = async () => {
    if (!uploadIds) {
      return null;
    }

    const result = await fetchAndNormaliseAllUploadResults(
      PIPELINE_DS,
      VALIDATION_ENDPOINTS.UPLOAD,
      {
        id: { in_list: { value: [...uploadIds] } },
      },
      // Pass in requested fields, not all data is required
      ["user.oidc_id", "date_started", "s3_filename"],
    );

    return result;
  };

  const uploadResults = useQueryData<IAllValidationData[] | null>(
    ["uploadResults", user.id],
    fetchPipelineData,
    {
      enabled: uploadIds.length > 0 && open === true,
      staleTime: 0,
    },
  );

  // Helper to handle reason changes within the rejection array of objects
  const handleReasonChange = (id: string, value: string) => {
    setRejectionReasons((prev: [{ id: string; reason: string }]) => {
      //find the index with id
      const index = prev.findIndex(
        (entry: IValidationRejectionReason) => entry.id === id,
      );

      // if this id is new, append to array
      if (index === -1) {
        return [...prev, { id: id, reason: value }];
      }

      // Otherwise update the existing entry
      const next = [...prev];
      next[index] = { ...next[index], reason: value };
      return next;
    });
  };

  // Call the endpoint with rejection reasons and invalidate queries.
  const handleRejection = async () => {
    await rejectSubmission(rejectionReasons, setOpen);
    // Invalidate each id
    uploadIds.forEach(async (id: string) => {
      await queryClient.invalidateQueries({
        queryKey: ["latestPipelineResults", id],
      });
    });
    setRejectionReasons([]);
    setForceTableUpdate?.((prev: boolean) => !prev);
  };

  const ModalHeader = (
    <h3>{`Reject Submission${uploadIds.length > 1 ? "s" : ""}`}</h3>
  );

  const ModalContent = (
    <>
      {uploadIds
        .sort((a: string, b: string) => Number(b) - Number(a))
        .map((id: string, index: number) => {
          return (
            <div key={id} className="tol-file-validation-rejection-box">
              <h6 className="tol-file-validation-rejection-reason">
                {`Please enter a reason for rejecting submission ${id}:`}
              </h6>
              <p>
                {splitS3FilenameString(
                  uploadResults?.data?.[index]?.s3Filename,
                )}{" "}
                - {uploadResults?.data?.[index]?.oidcId} -{" "}
                {new Date(
                  uploadResults?.data?.[index]?.dateStarted,
                ).toDateString()}
              </p>
              <InputGroup>
                <Input
                  name="submission-rejection-input"
                  placeholder="Rejection reason..."
                  value={
                    rejectionReasons.find(
                      (r: IValidationRejectionReason) => r.id === id,
                    )?.reason ?? ""
                  }
                  onChange={(value: string) => handleReasonChange(id, value)}
                />
              </InputGroup>
            </div>
          );
        })}
    </>
  );

  const ActionButton = (
    <Button
      icon="check"
      onClick={async () => {
        // Ensure users enter a rejection reason for all submissions.
        if (uploadIds.length !== rejectionReasons.length) {
          PopUpMessage({
            type: "error",
            message: "Please enter a reason for ALL rejections.",
          });
          return;
        }
        await handleRejection();
        setSelectedRows?.([]);
      }}
      timeout={2000}
    />
  );

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      children={
        uploadResults.isSuccess ? (
          ModalContent
        ) : (
          <TolLoader size="lg" content="Loading Details..." vertical />
        )
      }
      header={ModalHeader}
      actionButton={ActionButton}
      actionButtonInline
      size={"sm"}
    />
  );
}
