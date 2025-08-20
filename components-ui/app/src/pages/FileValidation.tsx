/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FileValidation as FV } from "../tol-ui/src";

const VALIDATION_CONFIG = {
  s3_url: "your_s3_url_here",
  pipeline_id: 1,
  destination: "random_destination",
};

export function FileValidation() {
  return <FV objectType="nothing_yet" validationConfig={VALIDATION_CONFIG} />;
}
