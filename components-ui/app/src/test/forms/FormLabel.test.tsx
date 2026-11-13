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

describe("read-only field labels", () => {
  test.each([undefined, null, "", [], {}, { first: "" }])(
    "shows Locked for an empty read-only value (%j)",
    (value) => {
      render(<FormLabel label="Title" readOnly value={value} />);
      expect(screen.getByText("Locked")).toBeInTheDocument();
      expect(screen.queryByText("Read-only")).not.toBeInTheDocument();
    },
  );

  test.each(["A title", 0, false, ["A title"], { first: "A title" }])(
    "preserves Read-only for a populated value (%j)",
    (value) => {
      render(<FormLabel label="Title" readOnly value={value} />);
      expect(screen.getByText("Read-only")).toBeInTheDocument();
      expect(screen.queryByText("Locked")).not.toBeInTheDocument();
    },
  );

  test.each([{ locked: true }, { sectionLocked: true }])(
    "shows Locked for an empty field with inherited locking (%j)",
    (options) => {
      render(
        <FormOptionsContext.Provider value={options}>
          <FormLabel label="Title" value="" />
        </FormOptionsContext.Provider>,
      );
      expect(screen.getByText("Locked")).toBeInTheDocument();
    },
  );

  test("keeps automatic status higher priority than Locked", () => {
    render(<FormLabel label="Title" readOnly automatic value="" />);
    expect(screen.getByText("Auto-generated")).toBeInTheDocument();
    expect(screen.queryByText("Locked")).not.toBeInTheDocument();
  });

  test("does not mark an editable empty field as Locked", () => {
    render(<FormLabel label="Title" value="" />);
    expect(screen.queryByText("Locked")).not.toBeInTheDocument();
  });
});
