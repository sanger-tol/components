/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, Dispatch, SetStateAction } from "react";
import { Input, InputGroup } from "rsuite";

import {
  Modal,
  Button,
  mutateSubmission,
  PopUpMessage,
  VALIDATION_ENDPOINTS,
  fetchAndNormaliseAllUploadResults,
  PIPELINE_DS,
  getUserFromLocalStorage,
  useQueryData,
  TolLoader,
} from "../..";

import type {
  IValidationSubmissionMutation,
  TValidationSubmissionMutations,
  IAllValidationData,
} from "../..";

export interface PSubmissionMutateModal {
  /**
   * Modal open boolean
   */
  open: boolean;
  /**
   * Function to set modal open boolean state
   */
  setOpen: (open: boolean) => void;
  /**
   * List of IDs of items to be rejected
   */
  uploadIds: string[] | {}[];
  /**
   * Attribute to mutate (only two usecases for now)
   */
  attribute: "rejection_reason" | "upload_name";
  /**
   * Optional callback to clear the selected rows after performing a status update
   */
  setSelectedRows?: Dispatch<SetStateAction<string[]>>;
  /**
   * Optional callback to manually refetch results when useQuery is disabled on validation completion
   */
  onSuccess?: () => void;
}

export function SubmissionMutateModal(props: PSubmissionMutateModal) {
  const {
    open,
    setOpen,
    uploadIds,
    attribute,
    setSelectedRows,
    onSuccess,
  } = props;

  const [attributes, setAttributes] = useState<TValidationSubmissionMutations>(
    [],
  );

  const user = getUserFromLocalStorage();

  const fetchPipelineData = async () => {
    if (!uploadIds) {
      return null;
    }

    const result = await fetchAndNormaliseAllUploadResults(
      PIPELINE_DS,
      VALIDATION_ENDPOINTS.UPLOAD,
      {
        id: {
          in_list: {
            value: Object.values(uploadIds).map(
              (upload: Partial<IAllValidationData>) => upload.id,
            ),
          },
        },
      },
      // Pass in requested fields, not all data is required
      ["user.oidc_id", "date_started", "upload_name"],
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
  const handleMutation = (id: string, value: string) => {
    setAttributes((prev: TValidationSubmissionMutations) => {
      //find the index with id
      const index = prev.findIndex(
        (entry: IValidationSubmissionMutation) => entry.id === id,
      );

      // if this id is new, append to array
      if (index === -1) {
        return [...prev, { id: id, attributeValue: value }];
      }

      // Otherwise update the existing entry
      const next = [...prev];
      next[index] = { ...next[index], attributeValue: value };
      return next;
    });
  };

  const messages = {
    success: `Items ${attribute === "rejection_reason" ? "rejected" : "renamed"} successfully.`,
    error: `Could not ${attribute === "rejection_reason" ? "reject" : "rename"} item(s), please try again.`,
  };

  // Call the endpoint with rejection reasons and invalidate queries.
  const handleAttributeSet = async () => {
    await mutateSubmission(attributes, messages, attribute, setOpen);

    onSuccess?.();
  };

  const ModalHeader = (
    <h3>{`${
      attribute === "rejection_reason" ? "Reject" : "Rename"
    } Submission${uploadIds.length > 1 ? "s" : ""}:`}</h3>
  );

  const ModalContent = (
    <>
      {uploadIds
        .sort((a: string, b: string) => Number(b) - Number(a))
        .map((item: { id: string }, index: number) => {
          return (
            <div
              key={item.id || index}
              className="tol-file-validation-rejection-box tol-file-validation-rejection-reason"
            >
              <h6>
                {`Please enter a ${
                  attribute === "rejection_reason"
                    ? "reason for rejecting"
                    : "new name for"
                } submission ${item?.id}:`}
              </h6>
              <p>
                {uploadResults?.data?.[index]?.uploadName}
                {user?.roles?.includes("admin")
                  ? ` - ${uploadResults?.data?.[index]?.oidcId}`
                  : ""}{" "}
                -{" "}
                {new Date(
                  uploadResults?.data?.[index]?.dateStarted,
                ).toDateString()}
              </p>
              <InputGroup>
                <Input
                  name="submission-rejection-input"
                  placeholder={
                    attribute === "rejection_reason"
                      ? "Rejection reason..."
                      : "New name..."
                  }
                  value={
                    attributes.find(
                      (r: IValidationSubmissionMutation) => r.id === item.id,
                    )?.attributeValue ?? ""
                  }
                  onChange={(value: string) => handleMutation(item.id, value)}
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
        // Ensure users enters data for all submissions.
        if (uploadIds.length !== attributes.length) {
          PopUpMessage({
            type: "error",
            message: `Please enter a ${
              attribute === "rejection_reason"
                ? "reason for ALL rejections."
                : "new name for all selections"
            }.`,
          });
          return;
        }
        await handleAttributeSet();

        setSelectedRows?.([]);
        setAttributes([]);
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
