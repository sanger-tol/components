/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/
import { httpClient, PopUpMessage, TsDataSource } from "../index";

export type severityType = "error" | "warning";

export interface Step {
  id: string;
  stepName: string;
  errors?: string[];
}

export interface IUploadStatus {
  className: string;
  text: string;
}

export interface IErrorWarningCount {
  errors: number;
  warnings: number;
}
export interface IValidationResult {
  code: string;
  detail: string;
  field: string | null;
  objectId: string;
  severity: severityType;
  stepName: string;
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
  failureMessage?: string | null;
}

export const FILE_VALIDATION_PATH = "/file-validation/results/"; // TODO: ADD CONSTANT

export function getErrorWarningCounts(results: IValidationResult[]): {
  errors: number;
  warnings: number;
} {
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

export function getStepsInResults(results: IValidationResult[]): string[] {
  const stepNames = new Set<string>();

  results.forEach((result) => {
    if (result.stepName) {
      stepNames.add(result.stepName);
    }
  });

  return Array.from(stepNames);
}

export function normaliseValidationResult(result: any): IValidationResult {
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
  upload: any,
  relationships: any
): Promise<IPipelineUpload> {
  const pipeline = await relationships?.pipeline;
  const pipelineSteps = await getStepsInPipeline(pipeline.id);
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
    if (setLoading) {
      setLoading(false);
    }
  }
}

export async function fetchAndNormaliseAllUploadResults(
  ds: TsDataSource,
  endpoint: string,
  userId: string,
  setAllUploadResults: (results: IPipelineUpload[]) => void,
  setHasErrors: (hasErrors: boolean) => void,
  setLoading: (loading: boolean) => void
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
        results.map((upload: any) =>
          normalisePipelineUpload(upload, upload.relationships)
        )
      );
      console.log("Normalised Results:", normalisedResults);
      setAllUploadResults(normalisedResults);
    }
  } catch (error) {
    console.error("Error fetching all upload results:", error);
    PopUpMessage({
      type: "error",
      message: "Failed to fetch upload results. Please try again.",
    });
    setAllUploadResults([]);
    setHasErrors(true);
  } finally {
    setLoading(false);
  }
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
      text: "Completed with Warnings",
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

export async function getStepsInPipeline(pipelineId: string) {
  const res = await httpClient().get("local/pipeline_steps", {
    params: {},
    filter: {
      and_: {
        pipeline_id: { eq: { value: pipelineId } },
      },
    },
  });

  return res.data.data.map((step: any) => step.attributes.step_name);
}

export function goToResults(
  history: any,
  pipelineId: string,
  stepName?: string,
  errorWarningCount: number = 0
) {
  console.log(errorWarningCount);
  history.push(
    `${FILE_VALIDATION_PATH}${pipelineId}${
      errorWarningCount > 2 && stepName ? `?stepName=${stepName}` : ""
    }`
  );
}
