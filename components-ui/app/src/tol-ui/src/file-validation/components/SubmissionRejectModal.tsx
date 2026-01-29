/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Input, InputGroup } from "rsuite";
import { useQueryClient } from "@tanstack/react-query";
import { Modal, Button, rejectSubmission } from "../..";

export interface PSubmissionRejectModal {
  open: boolean;
  setOpen: (open: boolean) => void;
  uploadId: string;
}

export function SubmissionRejectModal(props: PSubmissionRejectModal) {
  const { open, setOpen, uploadId } = props;
  const queryClient = useQueryClient();

  const [rejectionReason, setRejectionReason] = useState<string>("");

  const handleRejection = async () => {
    await rejectSubmission(rejectionReason, uploadId, setOpen);
    await queryClient.invalidateQueries({
      queryKey: ["latestPipelineResults", uploadId],
    });
  };

  const ModalHeader = <h3>Rejection Reason</h3>;

  const ModalContent = (
    <>
      <p className="tol-file-validation-rejection-reason">
        Please enter a reason for rejecting this submission:
      </p>
      <InputGroup>
        <Input
          name="submission-rejection-input"
          value={rejectionReason}
          onChange={setRejectionReason}
        />
      </InputGroup>
    </>
  );

  const ActionButton = (
    <Button
      icon="check"
      onClick={async () => await handleRejection()}
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
