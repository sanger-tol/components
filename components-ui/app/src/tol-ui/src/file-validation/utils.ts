/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/
import { History } from "history";
import { ApiMethods, VALIDATION_ENDPOINTS } from "../constants";
import { PopUpMessage, TsDataSource } from "../index";
import { DataObject } from "../services/http/TsDataSource";
import { MessageType } from "./messaging/Message";

export type TSeverity = "error" | "warning";
export type IconType = "check" | "xmark" | "exclamation";

export interface ICellId {
  column: string;
  row: string;
}

export interface IUploadStatus {
  className: string;
  text: string;
}

export interface IValidationConfig {
  s3_url: string;
  pipeline_name: string;
  destination: string;
}

export interface IErrorWarningCount {
  errors: number;
  warnings: number;
}

interface IValidationResultAPI {
  code: string;
  detail: string;
  field: string | null;
  object_id: string;
  severity: TSeverity;
  step_name: string;
}

export interface IValidationResult {
  code: string;
  detail: string;
  field: string | null;
  objectId: string;
  severity: TSeverity;
  stepName: string;
}

export interface IPipelineUploadAPI {
  id: string;
  completed: boolean;
  date_started: string;
  flow_run_id: string;
  s3_filename: string;
  validation_results: IValidationResult[];
  failure_message: string | null;
}

export interface IPipelineUpload {
  id: string;
  completed: boolean;
  dateStarted: string;
  flowRunId: string;
  pipelineName: string;
  pipelineId: string;
  pipelineSteps: string[];
  s3Filename: string;
  validationResults: IValidationResult[];
  failureMessage: string | null;
}

export const FILE_VALIDATION_PATH = "/file-validation/results/";
export const REFRESH_INTERVAL = 5000; // 5 seconds
export const TOL_LOADER_STYLES = {
  minHeight: "250px",
  flexDirection: "column",
  alignItems: "center",
  display: "flex",
};

const pipelineStepsPromiseCache = new Map<string, Promise<string[]>>();

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

//@ts-ignore
export function downloadItem(filename: string) {
  //TODO: Implement download functionality
}

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

export async function normalisePipelineUpload(
  ds: TsDataSource,
  upload: DataObject,
  relationships: { [key: string]: Promise<DataObject> }
): Promise<IPipelineUpload> {
  const pipeline = await relationships?.pipeline;
  const pipelineSteps = await getStepsInPipeline(ds, pipeline.id);
  return {
    completed: upload.completed,
    dateStarted: upload.date_started,
    flowRunId: upload.flow_run_id,
    id: upload.id,
    pipelineName: pipeline.name,
    pipelineId: pipeline.id,
    pipelineSteps: pipelineSteps || [],
    s3Filename: upload.s3_filename,
    validationResults: upload.validation_results.map(normaliseValidationResult),
    failureMessage: upload.failure_message || null,
  };
}

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

export async function uploadPipelineConfig(
  ds: TsDataSource,
  config: IValidationConfig,
  fileName: string,
  spreadsheetConfig: string
): Promise<IPipelineUpload | null> {
  const body = {
    s3_url: config.s3_url,
    s3_filename: fileName,
    spreadsheet_config: spreadsheetConfig,
    pipeline_name: config.pipeline_name,
    destination: config.destination,
  };
  try {
    const response = await ds.custom(
      VALIDATION_ENDPOINTS.RUN_PIPELINE,
      ApiMethods.POST,
      body
    );
    if (response) {
      return response.data["upload_id"];
    }
    return null;
  } catch (error) {
    console.error("Error initiating validation:", error);
    PopUpMessage({
      type: "error",
      message: "Failed to initiate validation. Please try again.",
    });
    return null;
  }
}

export function constructCompletionMessage(
  validationResults: IValidationResult[],
  failureMessage: string | null
): { message: string; messageType: MessageType } {
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
    return res?.map((step: DataObject) => step.step_name) || [];
  })();

  pipelineStepsPromiseCache.set(pipelineId, stepPromise);

  return stepPromise;
}

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
