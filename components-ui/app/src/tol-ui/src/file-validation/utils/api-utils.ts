/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  API_METHODS,
  VALIDATION_ENDPOINTS,
  S3_ENDPOINTS,
  PIPELINE_DS,
  VALIDATION_TIMEOUT_MS,
  PopUpMessage,
  FILE_VALIDATION_STATUS,
  VALIDATIONS,
} from "../../";

import { splitS3FilenameString, normaliseValidationResult } from "./utils";

import type {
  IFileData,
  TStepsData,
  TsDataSource,
  TDataObjectOrNull,
  IValidationConfig,
  IAllValidationData,
} from "../..";

// Caches steps in pipeline, as they won't change very often, reduces call number.
const pipelineStepsPromiseCache = new Map<string, Promise<TStepsData>>();

/**
 * Downloads a file from an S3 bucket via the API and triggers a browser download.
 *
 * Queries the S3 download endpoint to retrieve the file as a blob. It then creates a temporary
 * anchor element to programmatically trigger the download in the browser, using a cleaned
 * version of the filename.
 *
 * @param ds - The TsDataSource instance used to perform the API request.
 * @param s3_bucket - The name of the S3 bucket where the file is stored.
 * @param filename - The full name of the file in S3 (including prefixes).
 * @returns A Promise that resolves when the download initiation is complete.
 */

export async function downloadFileFromS3(
  ds: TsDataSource,
  s3_bucket: string,
  filename: string,
): Promise<void> {
  const body = {
    data: {
      file_name: filename,
      s3_bucket: s3_bucket,
    },
  };
  try {
    const response = await ds.custom({
      method: API_METHODS.POST,
      resource: S3_ENDPOINTS.DOWNLOAD,
      body: body,
      options: {
        responseType: "blob",
      },
    });

    const blob = new Blob([response.data], {
      type: "application/octet-stream",
    });

    const downloadUrl = window.URL.createObjectURL(blob);
    const downloadElement = document.createElement("a");
    downloadElement.href = downloadUrl;
    downloadElement.download = splitS3FilenameString(String(filename));
    downloadElement.click();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Error downloading file: ", error);
    PopUpMessage({
      type: "error",
      message: "Failed to download file. Please try again.",
    });
  }
}

/**
 * Uploads a file to an S3 bucket via the API.
 *
 * Constructs a FormData payload containing the file and the target S3 bucket name,
 * then sends a POST request to the configured S3 upload endpoint.
 *
 * @param ds - The TsDataSource instance used to perform the API request.
 * @param file - The standard File object to be uploaded.
 * @param s3Bucket - The name of the target S3 bucket.
 * @returns A Promise that resolves to the API response containing upload details.
 */

export async function uploadFileToS3(
  ds: TsDataSource,
  file: File,
  s3Bucket: string,
): Promise<TDataObjectOrNull> {
  const body = new FormData();
  body.append("file", file);
  body.append("s3_bucket", s3Bucket);

  return await ds.custom({
    method: API_METHODS.POST,
    resource: S3_ENDPOINTS.UPLOAD,
    body: body,
  });
}

/**
 * Normalises a pipeline upload object and its relationships into the internal IAllValidationData format.
 *
 * @param ds - The TsDataSource instance used for fetching related pipeline steps.
 * @param upload - The raw upload object to normalise.
 * @param relationships - An object containing promises for related entities, such as the pipeline.
 * @returns A Promise that resolves to an IAllValidationData object with all fields mapped and normalised.
 *
 * This function fetches pipeline steps if a pipeline relationship exists,
 * and maps all relevant fields from the raw upload and its relationships.
 */

export async function normalisePipelineUpload(
  ds: TsDataSource,
  upload: TDataObjectOrNull,
  relationships: any,
): Promise<IAllValidationData> {
  const pipeline = await relationships?.pipeline;
  const pipelineSteps = pipeline
    ? await getStepsInPipeline(ds, pipeline.id)
    : [];
  return {
    completed: upload?.completed || false,
    dateStarted: upload?.date_started || "",
    flowRunId: upload?.flow_run_id,
    id: upload?.id || "",
    pipelineName: pipeline?.name || "",
    pipelineId: pipeline?.id || "",
    pipelineSteps: pipelineSteps || [],
    rejectionReason: upload?.rejection_reason || "",
    validationStatus: upload?.validation_status,
    s3Filename: upload?.s3_filename || "",
    s3Bucket: upload?.s3_bucket || "",
    validationResults:
      upload?.validation_results?.map(normaliseValidationResult) || [],
    failureMessage: upload?.failure_message || null,
    hidden: upload?.hidden || false,
    oidcId: upload?.relationships?.user?.oidc_id || "",
    uploadName: upload?.upload_name || ""
  };
}

/**
 * Fetches the current pipeline results for a given upload ID from the API and normalises the response.
 *
 * @param ds - The TsDataSource instance used to perform the API request.
 * @param endpoint - The API endpoint to query for pipeline results.
 * @param andFilter - The filter used for fetching the required information, usually user_id
 * @returns A Promise that resolves to an IAllValidationData object if successful, or null if not.
 *
 * If the fetch fails, this function will trigger a popup error message and update error/loading state if callbacks are provided.
 */

export async function fetchCurrentPipelineResults(
  ds: TsDataSource,
  endpoint: string,
  andFilter: any,
): Promise<IAllValidationData | null> {
  try {
    const results = await ds.getListPage({
      objectType: endpoint,
      filter: {
        and_: andFilter,
      },
    });
    if (results) {
      const normalisedResults = await normalisePipelineUpload(
        ds,
        results[0],
        results[0].relationships,
      );
      return normalisedResults;
    }
    return null;
  } catch (error) {
    console.error("Error fetching current pipeline results:", error);
    PopUpMessage({
      type: "error",
      message: "Failed to fetch pipeline results. Please try again.",
    });
    return null;
  }
}

/**
 * Fetches and normalises all upload results for a given user ID from the API.
 *
 * @param ds - The TsDataSource instance used to perform the API request.
 * @param endpoint - The API endpoint to query for upload results.
 * @param andFilter - The filter used to get the required data, usually based on the users id.
 * @returns A Promise that resolves to an array of IAllValidationData objects if successful, or an empty array if not.
 *
 * If the fetch fails, this function will trigger a popup error message and update error/loading state via the provided callbacks.
 */
export async function fetchAndNormaliseAllUploadResults(
  ds: TsDataSource,
  endpoint: string,
  andFilter: any,
  requestedFields?: string[],
) {
  try {
    const results = await ds.getListPage({
      objectType: endpoint,
      filter: {
        and_: andFilter,
      },
      requestedFields: requestedFields,
    });
    if (results) {
      const normalisedResults = await Promise.all(
        results.map((upload) =>
          normalisePipelineUpload(ds, upload, upload.relationships || {}),
        ),
      );
      return [...normalisedResults];
    }
    return [];
  } catch (error) {
    console.error("Error fetching all upload results:", error);
    PopUpMessage({
      type: "error",
      message: "Failed to fetch upload results. Please try again.",
    });
    return [];
  }
}

/**
 * Initiates a pipeline validation run by uploading the configuration and file information to the API.
 *
 * @param ds - The TsDataSource instance used to perform the API request.
 * @param config - The validation configuration containing pipeline and destination details.
 * @param fileName - The name of the file to be validated.
 * @param spreadsheetConfig - The spreadsheet configuration string.
 * @returns A Promise that resolves to the upload ID if successful, or null if the request fails.
 *
 * If the request fails, this function will trigger a popup error message.
 */

export async function uploadPipelineConfig(
  ds: TsDataSource,
  config: IValidationConfig,
  file: IFileData,
  uploadName: string,
  dry_run: boolean = true,
  uploadId?: string,
  spreadsheetConfig?: string,
): Promise<string | null | undefined> {
  let s3Filename: string | undefined = undefined;
  const data = {
    s3_bucket: config.s3_bucket,
    spreadsheet_config: spreadsheetConfig || null,
    pipeline_id: config.pipeline_id,
    dry_run: dry_run,
    upload_name: uploadName,
    destination: config.destination,
    upload_id: uploadId || null,
    completed: true,
  };

  try {
    if (!uploadId) {
      const uploadResponse = await uploadFileToS3(
        ds,
        file.blobFile,
        config.s3_bucket,
      );

      if (!uploadResponse || uploadResponse.status !== 200) {
        PopUpMessage({
          type: "error",
          message: "Failed to upload file. Please try again.",
        });
        return null;
      }

      s3Filename = uploadResponse.data.file_name;

      PopUpMessage({
        type: "success",
        message: "File uploaded for validation successfully.",
      });
    }

    try {
      const response = await ds.custom({
        method: API_METHODS.POST,
        resource: VALIDATION_ENDPOINTS.RUN_PIPELINE,
        body: {
          data: {
            ...data,
            ...(s3Filename ? { s3_filename: s3Filename } : {}),
          },
        },
      });

      if (response && !uploadId) {
        if (response.status === 200) {
          PopUpMessage({
            type: "success",
            message: "Validation started successfully.",
          });
          return response.data["upload_id"];
        } else {
          PopUpMessage({
            type: "error",
            message: "Failed to start validation. Please try again.",
          });
          return null;
        }
      } else {
        if (response && uploadId) {
          PopUpMessage({
            type: "success",
            message: "File submitted successfully.",
          });
        }
      }
    } catch (pipelineError) {
      console.error("Error running pipeline:", pipelineError);
      PopUpMessage({
        type: "error",
        message: "Failed to start validation. Please try again.",
      });
      return null;
    }
  } catch (uploadError) {
    console.error("Error uploading file:", uploadError);
    PopUpMessage({
      type: "error",
      message: "Failed to upload file. Please try again.",
    });
    return null;
  }
}

/**
 * Retrieves the step names for a given pipeline ID, using a cache to avoid redundant API requests.
 *
 * @param ds - The TsDataSource instance used to perform the API request.
 * @param pipelineId - The ID of the pipeline whose steps are to be fetched.
 * @returns A Promise that resolves to an array of step name strings.
 *
 * If the steps for the given pipeline ID are already cached, the cached promise is returned.
 * Otherwise, the steps are fetched from the API and cached before returning.
 */

export async function getStepsInPipeline(ds: TsDataSource, pipelineId: string) {
  if (pipelineStepsPromiseCache.has(pipelineId))
    return pipelineStepsPromiseCache.get(pipelineId);

  const stepPromise = (async () => {
    const res = await ds.getListPage({
      objectType: VALIDATION_ENDPOINTS.PIPELINE_STEPS,
      filter: {
        and_: {
          pipeline_id: { eq: { value: pipelineId } },
          is_visible: { eq: { value: true } },
        },
      },
    });
    return (
      res
        ?.sort((a, b) => {
          if (a.stage !== b.stage) {
            return a.stage - b.stage;
          } else {
            return a.step_order - b.step_order;
          }
        })
        .flatMap((step: TDataObjectOrNull) =>
          step
            ? [
                {
                  name: step.step_name,
                  description: step.description || "",
                },
              ]
            : [],
        ) || []
    );
  })();

  pipelineStepsPromiseCache.set(pipelineId, stepPromise);

  return stepPromise;
}

/**
 * Checks for and marks long-running incomplete uploads as timed out in the database.
 *
 * Fetches all active uploads for the given user that have exceeded the `VALIDATION_TIMEOUT_MS`.
 * It then constructs a payload to update these uploads (plus an optional current pipeline ID)
 * to a "validation_timeout" status with a relevant failure message.
 *
 * @param ds - The datasource used to query and update upload records.
 * @param userId - The ID of the user whose uploads should be checked.
 * @param currentPipelineId - (Optional) ID of a specific pipeline run to include in the timeout check.
 * @returns A promise that resolves when the update operation is complete.
 */

export async function setValidationTimeout(
  ds: TsDataSource,
  userId: string,
  currentPipelineId?: string,
): Promise<void> {
  if (!userId) return;
  const res = await ds.getListPage({
    objectType: VALIDATION_ENDPOINTS.UPLOAD,
    filter: {
      and_: {
        user_id: { eq: { value: userId } },
        completed: { eq: { value: false } },
        date_started: {
          lt: { value: new Date(Date.now() - VALIDATION_TIMEOUT_MS) },
        },
        failure_message: { eq: { value: null } },
      },
    },
  });

  const ids = res?.map((upload: TDataObjectOrNull) => upload?.id || "");
  if (currentPipelineId) ids?.push(currentPipelineId);

  if (!ids || ids.length === 0) return;

  const data = ids?.map((id: string) => ({
    id: id,
    type: VALIDATIONS.UPLOAD,
    attributes: {
      failure_message: "Validation timed out.",
      validation_status: FILE_VALIDATION_STATUS.TIMEOUT,
      completed: true,
    },
  }));

  await ds.upsert({
    objectType: VALIDATION_ENDPOINTS.UPLOAD,
    payload: data,
  });
}

/**
 * Submits a file for validation by uploading it through the pipeline configuration.
 *
 * @param validationConfig - The validation configuration to apply to the file upload
 * @param fileList - An array of file data objects, where the first file will be submitted
 * @param currentUploadId - The ID of the current upload session, or null if not available
 * @param setFileUploaded - Callback function to update the file upload status
 * @returns void
 *
 * @remarks
 * This function uploads the first file from the fileList using the pipeline configuration.
 * On success, it sets the uploaded status to true and displays a success message.
 * On failure, it logs the error and displays an error message to the user.
 */

export async function submitFile(
  validationConfig: IValidationConfig,
  fileList: IFileData[],
  currentUploadId: string | null,
  setFileUploaded: (uploaded: boolean) => void,
): Promise<void> {
  await uploadPipelineConfig(
    PIPELINE_DS,
    validationConfig,
    fileList[0],
    true,
    currentUploadId ?? undefined,
  )
    .then(() => {
      setFileUploaded(true);
      PopUpMessage({
        type: "success",
        message: "File submitted successfully.",
      });
    })
    .catch((err) => {
      console.error("Error submitting file:", err);
      PopUpMessage({
        type: "error",
        message: "Failed to submit file. Please try again.",
      });
    });
}

/**
 * Marks a file upload as ready for submission by updating its status in the pipeline.
 *
 * This function performs an upsert operation to set the `is_ready` attribute to `true`
 * for the specified upload. It displays a success popup message on completion or an
 * error popup message if the operation fails.
 *
 * @param currentUploadId - The unique identifier of the upload to mark as ready
 * @param setMarkedAsReady - Callback function to update the marked-as-ready state,
 *                           invoked with `true` upon successful operation
 * @returns void
 */

export async function markFileAsReady(
  currentUploadId: string,
  setMarkedAsReady: () => void,
): Promise<void> {
  await PIPELINE_DS.upsert({
    objectType: VALIDATION_ENDPOINTS.UPLOAD,
    payload: [
      {
        type: "upload",
        id: currentUploadId,
        attributes: {
          is_ready: true,
        },
      },
    ],
  })
    .then(() => {
      setMarkedAsReady();
      PopUpMessage({
        type: "success",
        message: "File marked as ready for submission.",
      });
    })
    .catch((err) => {
      console.error("Error marking file as ready:", err);
      PopUpMessage({
        type: "error",
        message: "Failed to mark file as ready. Please try again.",
      });
    });
}
