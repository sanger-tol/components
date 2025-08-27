/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { History } from "history";
import {
  API_METHODS,
  VALIDATION_ENDPOINTS,
  PopUpMessage,
  TsDataSource,
  TMessageType,
  TDataObjectOrNull,
  IValidationResult,
  IValidationResultAPI,
  IPipelineUpload,
  IValidationConfig,
  FILE_VALIDATION_PATH,
  S3_ENDPOINTS,
  IFileData,
} from "..";

const pipelineStepsPromiseCache = new Map<string, Promise<string[]>>();

/**
 * Counts the number of errors and warnings in a list of validation results.
 *
 * @param results - An array of IValidationResult objects to analyze.
 * @returns An object containing the total number of errors and warnings.
 *
 * If the input is not an array, returns { errors: 0, warnings: 0 }.
 */

export function getErrorWarningCounts(results: IValidationResult[]): {
  errors: number;
  warnings: number;
} {
  if (!Array.isArray(results)) {
    return { errors: 0, warnings: 0 };
  }
  return results.reduce(
    (acc, result) => {
      if (result.severity === "warning") {
        acc.warnings += 1;
      } else if (result.severity === "error") {
        acc.errors += 1;
      }
      return acc;
    },
    { errors: 0, warnings: 0 }
  );
}

export async function downloadFileFromS3(
  ds: TsDataSource,
  s3_bucket: string,
  filename: string
) {
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
    downloadElement.download = filename;
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

export function uploadFileToS3(ds: TsDataSource, file: File, s3Bucket: string) {
  const body = new FormData();
  body.append("file", file);
  body.append("s3_bucket", s3Bucket);

  return ds.custom({
    method: API_METHODS.POST,
    resource: S3_ENDPOINTS.UPLOAD,
    body: body,
  });
}

/**
 * Normalises a validation result received from the API into the internal IValidationResult format.
 *
 * @param result - The raw validation result object from the API.
 * @returns An IValidationResult object with mapped and defaulted fields.
 */

export function normaliseValidationResult(
  result: IValidationResultAPI
): IValidationResult {
  return {
    code: result.code,
    detail: result.detail,
    field: result.field || null,
    objectId: result.object_id,
    severity: result.severity,
    stepName: result.step_name,
  };
}

/**
 * Normalises a pipeline upload object and its relationships into the internal IPipelineUpload format.
 *
 * @param ds - The TsDataSource instance used for fetching related pipeline steps.
 * @param upload - The raw upload object to normalise.
 * @param relationships - An object containing promises for related entities, such as the pipeline.
 * @returns A Promise that resolves to an IPipelineUpload object with all fields mapped and normalised.
 *
 * This function fetches pipeline steps if a pipeline relationship exists,
 * and maps all relevant fields from the raw upload and its relationships.
 */

export async function normalisePipelineUpload(
  ds: TsDataSource,
  upload: TDataObjectOrNull,
  relationships: any
): Promise<IPipelineUpload> {
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
    s3Filename: upload?.s3_filename || "",
    s3Url: upload?.s3_url || "",
    validationResults:
      upload?.validation_results.map(normaliseValidationResult) || [],
    failureMessage: upload?.failure_message || null,
  };
}

/**
 * Fetches the current pipeline results for a given upload ID from the API and normalises the response.
 *
 * @param ds - The TsDataSource instance used to perform the API request.
 * @param endpoint - The API endpoint to query for pipeline results.
 * @param uploadId - The ID of the upload to fetch results for.
 * @param setPipelineResult - Optional callback to set the normalised pipeline result in state.
 * @param setHasErrors - Optional callback to set error state if the fetch fails.
 * @param setLoading - Optional callback to set loading state during the fetch.
 * @returns A Promise that resolves to an IPipelineUpload object if successful, or null if not.
 *
 * If the fetch fails, this function will trigger a popup error message and update error/loading state if callbacks are provided.
 */

export async function fetchCurrentPipelineResults(
  ds: TsDataSource,
  endpoint: string,
  uploadId: string,
  setPipelineResult?: (results: IPipelineUpload | null) => void,
  setHasErrors?: (hasErrors: boolean) => void,
  setLoading?: (loading: boolean) => void | null
): Promise<IPipelineUpload | null> {
  try {
    const results = await ds.getListPage({
      objectType: endpoint,
      filter: {
        and_: {
          id: { eq: { value: uploadId } },
        },
      },
    });
    if (results) {
      const normalisedResults = await normalisePipelineUpload(
        ds,
        results[0],
        results[0].relationships
      );
      if (setPipelineResult) setPipelineResult(normalisedResults);
      return normalisedResults;
    }
    return null;
  } catch (error) {
    console.error("Error fetching current pipeline results:", error);
    PopUpMessage({
      type: "error",
      message: "Failed to fetch pipeline results. Please try again.",
    });
    if (setPipelineResult) setPipelineResult(null);
    if (setHasErrors) setHasErrors(true);
    return null;
  } finally {
    if (setLoading) setLoading(false);
  }
}

/**
 * Fetches and normalises the upload result for a given upload ID from the API.
 *
 * @param ds - The TsDataSource instance used to perform the API request.
 * @param endpoint - The API endpoint to query for the upload result.
 * @param uploadId - The ID of the upload to fetch results for.
 * @param setPipelineResult - Callback to set the normalised pipeline result in state.
 * @param setHasErrors - Callback to set error state if the fetch fails.
 * @param setLoading - Optional callback to set loading state during the fetch.
 * @returns A Promise that resolves when the operation is complete.
 *
 * If the fetch fails, this function will trigger a popup error message and update error/loading state via the provided callbacks.
 */

export async function fetchAndNormaliseUploadResult(
  ds: TsDataSource,
  endpoint: string,
  uploadId: string,
  setPipelineResult: (results: IPipelineUpload | null) => void,
  setHasErrors: (hasErrors: boolean) => void,
  setLoading?: (loading: boolean) => void | null
): Promise<void> {
  try {
    const results = await ds.getOne({
      objectType: endpoint,
      id: uploadId,
    });
    if (results) {
      const normalisedResults = await normalisePipelineUpload(
        ds,
        results,
        results.relationships
      );
      setPipelineResult(normalisedResults);
    }
  } catch (error) {
    console.error("Error fetching upload results:", error);
    PopUpMessage({
      type: "error",
      message: "Failed to fetch upload result. Please try again.",
    });
    setPipelineResult(null);
    setHasErrors(true);
  } finally {
    if (setLoading) setLoading(false);
  }
}

/**
 * Fetches and normalises all upload results for a given user ID from the API.
 *
 * @param ds - The TsDataSource instance used to perform the API request.
 * @param endpoint - The API endpoint to query for upload results.
 * @param userId - The ID of the user whose uploads are to be fetched.
 * @param setAllUploadResults - Optional callback to set the array of normalised pipeline upload results in state.
 * @param setHasErrors - Optional callback to set error state if the fetch fails.
 * @param setLoading - Optional callback to set loading state during the fetch.
 * @returns A Promise that resolves to an array of IPipelineUpload objects if successful, or an empty array if not.
 *
 * If the fetch fails, this function will trigger a popup error message and update error/loading state via the provided callbacks.
 */

export async function fetchAndNormaliseAllUploadResults(
  ds: TsDataSource,
  endpoint: string,
  userId: string,
  setAllUploadResults?: (results: IPipelineUpload[]) => void,
  setHasErrors?: (hasErrors: boolean) => void,
  setLoading?: (loading: boolean) => void
) {
  try {
    const results = await ds.getListPage({
      objectType: endpoint,
      filter: {
        and_: {
          user_id: { eq: { value: userId } },
        },
      },
    });
    if (results) {
      const normalisedResults = await Promise.all(
        results.map((upload) =>
          normalisePipelineUpload(ds, upload, upload.relationships)
        )
      );
      if (setAllUploadResults) setAllUploadResults(normalisedResults);
      return [...normalisedResults];
    }
    return [];
  } catch (error) {
    console.error("Error fetching all upload results:", error);
    PopUpMessage({
      type: "error",
      message: "Failed to fetch upload results. Please try again.",
    });
    if (setAllUploadResults) setAllUploadResults([]);
    if (setHasErrors) setHasErrors(true);
    return [];
  } finally {
    if (setLoading) setLoading(false);
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
  dry_run: boolean = true,
  uploadId?: string,
  spreadsheetConfig?: string
): Promise<string | null | undefined> {
  const body = {
    data: {
      s3_url: config.s3_url,
      s3_filename: file.name,
      spreadsheet_config: spreadsheetConfig || null,
      pipeline_id: config.pipeline_id,
      dry_run: dry_run,
      destination: config.destination,
      upload_id: uploadId || null,
    },
  };

  try {
    if (!uploadId) {
      const uploadResponse = await uploadFileToS3(
        ds,
        file.blobFile,
        config.s3_url
      );

      if (uploadResponse.status !== 200) {
        PopUpMessage({
          type: "error",
          message: "Failed to upload file. Please try again.",
        });
        return null;
      }

      PopUpMessage({
        type: "success",
        message: "File uploaded for validation successfully.",
      });
    }

    try {
      const response = await ds.custom({
        method: API_METHODS.POST,
        resource: VALIDATION_ENDPOINTS.RUN_PIPELINE,
        body: body,
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
 * Constructs a completion message and message type based on validation results and failure status.
 *
 * @param validationResults - An array of IValidationResult objects to analyze for errors and warnings.
 * @param failureMessage - An optional failure message string indicating early termination.
 * @returns An object containing a user-friendly message and its corresponding message type.
 *
 * The returned message and type reflect whether validation passed, failed, completed with warnings,
 * or was terminated early due to a failure.
 */

export function constructCompletionMessage(
  validationResults: IValidationResult[],
  failureMessage: string | null
): { message: string; messageType: TMessageType } {
  const errorsAndWarnings = getErrorWarningCounts(validationResults);
  if (failureMessage) {
    return {
      message: `Validation terminated early: ${failureMessage}. File cannot be uploaded`,
      messageType: "error",
    };
  } else if (
    errorsAndWarnings.errors === 0 &&
    errorsAndWarnings.warnings === 0
  ) {
    return {
      message: "Validation passed successfully with no issues.",
      messageType: "success",
    };
  } else if (errorsAndWarnings.errors > 0) {
    return {
      message: `Validation failed with ${errorsAndWarnings.errors} error(s). File cannot be uploaded.`,
      messageType: "error",
    };
  } else if (errorsAndWarnings.warnings > 0) {
    return {
      message: `Validation completed with ${errorsAndWarnings.warnings} warning(s).`,
      messageType: "warning",
    };
  }
  return {
    message: "Could not detemine completion status.",
    messageType: "info",
  };
}

/**
 * Determines the upload status and corresponding display text based on completion state, error and warning counts, and failure message.
 *
 * @param completedStatus - Boolean indicating whether the upload process has completed.
 * @param overallErrors - The total number of errors found during validation.
 * @param overallWarnings - The total number of warnings found during validation.
 * @param failureMessage - An optional failure message indicating early termination or failure.
 * @returns An object containing a CSS class name and a status text string for display.
 *
 * The returned status reflects whether the upload passed, failed, completed with errors or warnings, or is still in progress.
 */

export function determineUploadStatus(
  completedStatus: boolean,
  overallErrors: number,
  overallWarnings: number,
  failureMessage: string | null
): { className: string; text: string } {
  if (failureMessage) {
    return { className: "failed", text: "Failed" };
  } else if (completedStatus && overallErrors === 0 && overallWarnings === 0) {
    return { className: "passed", text: "Passed" };
  } else if (completedStatus && overallErrors > 0) {
    return {
      className: "completed-with-errors",
      text: "Completed with Errors",
    };
  } else if (completedStatus && overallWarnings > 0) {
    return {
      className: "completed-with-warnings",
      text: "Passed with Warnings",
    };
  }
  return { className: "", text: "In Progress" };
}

/**
 * Determines the status of a pipeline step based on the number of errors and warnings.
 *
 * @param errorCount - An object containing the number of errors and warnings for the step.
 * @returns An object with a CSS class name and a status text string representing the step's status.
 *
 * Returns "error" if there are errors, "warning" if there are warnings, and "passed" if there are neither.
 */

export function determineStepStatus(errorCount: {
  errors: number;
  warnings: number;
}) {
  if (errorCount.errors > 0) {
    return { className: "error", text: "Error" };
  } else if (errorCount.warnings > 0) {
    return { className: "warning", text: "Warning" };
  }
  return { className: "passed", text: "Passed" };
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
        },
      },
    });
    return (
      res?.map((step: TDataObjectOrNull) => (step ? step.step_name : "")) || []
    );
  })();

  pipelineStepsPromiseCache.set(pipelineId, stepPromise);

  return stepPromise;
}

/**
 * Navigates to the results page for a specific pipeline upload, optionally including a step name in the query string.
 *
 * @param history - The history object used to perform navigation.
 * @param pipelineId - The ID of the pipeline upload to view results for.
 * @param stepName - (Optional) The name of the step to highlight in the results view.
 * @param errorWarningCount - (Optional) The total number of errors and warnings; if greater than 2 and stepName is provided, the stepName is included in the query string.
 */

export function goToResults(
  history: History,
  pipelineId: string,
  stepName?: string,
  errorWarningCount: number = 0
) {
  history.push(
    `${FILE_VALIDATION_PATH}${pipelineId}${
      errorWarningCount > 2 && stepName ? `?stepName=${stepName}` : ""
    }`
  );
}
