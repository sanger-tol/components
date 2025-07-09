/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FileValidation as FV } from "../tol-ui/src/file-validation";

const VALIDATION_CONFIG = {
  s3_url: "made-up-url",
  pipeline: "tos_manifest_validation",
  destination: "random_destination",
};

const data = [
  {
    code: "",
    field: "E",
    detail: "Field is required.",
    severity: "warning",
    object_id: "1",
    step_name: "species_not_null",
  },
  {
    code: "",
    field: "D",
    detail: "Field is required.",
    severity: "error",
    object_id: "2",
    step_name: "species_not_null",
  },
  {
    code: "",
    field: "B",
    detail: "Species cannot be null.",
    severity: "warning",
    object_id: "5",
    step_name: "species_not_null",
  },
  {
    code: "",
    field: null,
    detail: "Invalid value provided.",
    severity: "error",
    object_id: "1",
    step_name: "species_not_null",
  },
  {
    code: "",
    field: ["A", "F"],
    detail: "Field is required.",
    severity: "warning",
    object_id: "3",
    step_name: "species_not_null",
  },
  {
    code: "",
    field: ["C", "D", "F"],
    detail: "Invalid value provided.",
    severity: "warning",
    object_id: "4",
    step_name: "value_not_allowed",
  },
  {
    code: "",
    field: ["A", "B", "D"],
    detail: "Field is required.",
    severity: "error",
    object_id: "5",
    step_name: "value_not_allowed",
  },
  {
    code: "",
    field: ["A", "B", "C"],
    detail: "Value is not allowed.",
    severity: "error",
    object_id: "7",
    step_name: "value_not_allowed",
  },
  {
    code: "",
    field: ["B", "D"],
    detail: "Field is required.",
    severity: "warning",
    object_id: "1",
    step_name: "value_not_allowed",
  },
  {
    code: "",
    field: ["A", "C", "D", "E"],
    detail: "Species cannot be null.",
    severity: "warning",
    object_id: "6",
    step_name: "value_not_allowed",
  },
  {
    code: "",
    field: ["A", "B", "E", "F"],
    detail: "Species cannot be null.",
    severity: "warning",
    object_id: "10",
    step_name: "a_third_because_why_not",
  },
  {
    code: "",
    field: "D",
    detail: "Species cannot be null.",
    severity: "warning",
    object_id: "5",
    step_name: "a_third_because_why_not",
  },
  {
    code: "",
    field: ["A", "F"],
    detail: "Field is required.",
    severity: "error",
    object_id: "6",
    step_name: "a_third_because_why_not",
  },
  {
    code: "",
    field: ["C", "D", "E", "F"],
    detail: "Invalid value provided.",
    severity: "error",
    object_id: "1",
    step_name: "a_third_because_why_not",
  },
  {
    code: "",
    field: ["C", "F"],
    detail: "Field is required.",
    severity: "error",
    object_id: "2",
    step_name: "a_third_because_why_not",
  },
  {
    code: "",
    field: null,
    detail: "Field is required.",
    severity: "warning",
    object_id: "8",
    step_name: "and_a_fourth",
  },
  {
    code: "",
    field: ["B", "F"],
    detail: "Species cannot be null.",
    severity: "error",
    object_id: "2",
    step_name: "and_a_fourth",
  },
  {
    code: "",
    field: "A",
    detail: "Invalid value provided.",
    severity: "warning",
    object_id: "2",
    step_name: "and_a_fourth",
  },
  {
    code: "",
    field: ["C", "F"],
    detail: "Species cannot be null.",
    severity: "error",
    object_id: "8",
    step_name: "and_a_fourth",
  },
  {
    code: "",
    field: null,
    detail: "Invalid value provided.",
    severity: "error",
    object_id: "5",
    step_name: "and_a_fourth",
  },
];

function FileValidation() {
  return <FV data={data} validationConfig={VALIDATION_CONFIG} />;
}

export default FileValidation;
