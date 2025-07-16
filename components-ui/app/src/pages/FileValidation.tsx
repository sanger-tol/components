/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FileValidation as FV } from "../tol-ui/src/file-validation";

const VALIDATION_CONFIG = {
  s3_url: "made-up-url",
  pipeline_name: "tos_spreadsheet_validation",
  destination: "random_destination",
};

function FileValidation() {
  return <FV endpoint="" validationConfig={VALIDATION_CONFIG} />;
}

export default FileValidation;
