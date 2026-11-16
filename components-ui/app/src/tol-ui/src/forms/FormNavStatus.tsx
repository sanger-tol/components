/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Icon } from "..";
import type { TFieldNavStatus, TScrollNavGroupStatus } from "..";

export function FormNavStatus({
  status,
}: {
  status?: TFieldNavStatus | TScrollNavGroupStatus;
}) {
  if (!status || status === "none") return null;

  const kind = typeof status === "string" ? status : status.kind;
  const sectionComplete = typeof status !== "string" && kind === "complete";

  const recommendedRemaining =
    typeof status !== "string" && status.kind === "complete"
      ? (status.recommendedRemaining ?? 0)
      : 0;

  const count =
    typeof status === "object" && "count" in status ? status.count : 0;
  const fieldCount = `${count} ${count === 1 ? "field" : "fields"}`;

  const labels = {
    auto: "Auto-generated",
    locked: "Locked",
    error: count ? `${fieldCount} invalid` : "Invalid",
    required: "Required",
    remaining: `${fieldCount} remaining`,
    attention: `${fieldCount} ${count === 1 ? "needs" : "need"} attention`,
    complete: sectionComplete
      ? recommendedRemaining
        ? `Complete, ${recommendedRemaining} recommended ${recommendedRemaining === 1 ? "field" : "fields"} missing`
        : "Complete"
      : "Provided",
    recommended: "Recommended",
    optional: "Optional",
  };

  const icon =
    kind === "auto"
      ? "robot"
      : kind === "locked"
        ? "lock"
        : kind === "complete" && !sectionComplete
          ? "check"
          : kind === "required" ||
              kind === "remaining" ||
              kind === "error" ||
              kind === "attention"
            ? "circle"
            : undefined;

  return (
    <span
      className={`tol-form-sidenav-status tol-form-sidenav-status--${kind}`}
      title={labels[kind]}
    >
      {icon && (
        <span aria-hidden="true">
          <Icon icon={icon} />
        </span>
      )}
      <span
        className={
          kind === "complete" && !sectionComplete
            ? "tol-form-sidenav-status__sr-only"
            : undefined
        }
      >
        {labels[kind]}
      </span>
    </span>
  );
}
