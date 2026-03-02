/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FileValidation as FV } from "../../tol-ui/src";

const VALIDATION_CONFIG = {
  s3_bucket: "your_s3_bucket_here",
  pipeline_id: 1,
  destination: "random_destination",
};

export function FileValidation() {
  return <FV validationConfig={VALIDATION_CONFIG} />;
}
