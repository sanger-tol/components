/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, Dispatch, SetStateAction } from "react";
import { Input, InputGroup } from "rsuite";
import { useQueryClient } from "@tanstack/react-query";
import { Modal, Button, rejectSubmission, PopUpMessage } from "../..";

// TODO: Create interface/types for rejectionReasons
// TODO: Remove inline classes
export interface PSubmissionRejectModal {
  /**
   * Actual modal open state.
   */
  open: boolean;
  /**
   * Function to set modal open state.
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
}

export function SubmissionRejectModal(props: PSubmissionRejectModal) {
  const { open, setOpen, uploadIds, setForceTableUpdate } = props;
  const queryClient = useQueryClient();

  // Array of {uploadId, rejectionReason} objects
  const [rejectionReasons, setRejectionReasons] = useState<
    { id: string; reason: string }[]
  >([]);

  // Helper to handle reason changes within the rejection array of objects
  const handleReasonChange = (id: string, value: string) => {
    setRejectionReasons((prev: [{ id: string; reason: string }]) => {
      //find the index with id
      const index = prev.findIndex((entry) => entry.id === id);

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
    uploadIds.forEach(async (id) => {
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
        .sort((a, b) => Number(b) - Number(a))
        .map((id) => {
          return (
            <div key={id} style={{ marginBottom: "10px" }}>
              <h6
                className="tol-file-validation-rejection-reason"
                style={{ margin: 0 }}
              >
                {`Please enter a reason for rejecting submission ${id}:`}
              </h6>
              <p style={{ marginTop: 0, marginBottom: "4px" }}>
                submissionName - userId - date
              </p>
              <InputGroup>
                <Input
                  name="submission-rejection-input"
                  placeholder="Rejection reason..."
                  value={
                    rejectionReasons.find(
                      (r: { id: string; reason: string }) => r.id === id,
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
        // Make sure users enter a rejection reason for all submissions.
        if (uploadIds.length !== rejectionReasons.length) {
          PopUpMessage({
            type: "error",
            message: "Please enter a reason for ALL rejections.",
          });
          return;
        }
        await handleRejection();
      }}
      timeout={2000}
    />
  );

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      children={ModalContent}
      header={ModalHeader}
      actionButton={ActionButton}
      actionButtonInline
      size={"sm"}
    />
  );
}
