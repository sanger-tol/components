/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { FormLabel } from "../../tol-ui/src/forms/FormLabel";
import { FormOptionsContext } from "../../tol-ui/src/forms/FormOptionsContext";

vi.mock("../../tol-ui/src", async () => {
  const { Form } = await import("rsuite");
  return { RSForm: Form };
});

describe("recommended field labels", () => {
  test("shows the subtitle when explicitly enabled on an editable field", () => {
    render(<FormLabel label="Title" recommended />);
    expect(screen.getByText("Recommended")).toBeInTheDocument();
  });

  test("does not show the subtitle by default", () => {
    render(<FormLabel label="Title" />);
    expect(screen.queryByText("Recommended")).not.toBeInTheDocument();
  });

  test.each(["", "Existing value"])(
    "does not show the subtitle for a read-only field with value %j",
    (value) => {
      render(<FormLabel label="Title" recommended readOnly value={value} />);
      expect(screen.queryByText("Recommended")).not.toBeInTheDocument();
      expect(screen.getByText(value ? "Read-only" : "Locked")).toBeInTheDocument();
    },
  );

  test("gives automatic status precedence", () => {
    render(<FormLabel label="Title" recommended automatic />);
    expect(screen.getByText("Auto-generated")).toBeInTheDocument();
    expect(screen.queryByText("Recommended")).not.toBeInTheDocument();
  });

  test.each([{ locked: true }, { sectionLocked: true }])(
    "respects inherited locking (%j)",
    (options) => {
      render(
        <FormOptionsContext.Provider value={options}>
          <FormLabel label="Title" recommended />
        </FormOptionsContext.Provider>,
      );
      expect(screen.queryByText("Recommended")).not.toBeInTheDocument();
      expect(screen.getByText("Locked")).toBeInTheDocument();
    },
  );
});
