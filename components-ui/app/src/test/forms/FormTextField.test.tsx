/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { FormTextField } from "../../tol-ui/src/forms/FormTextField";

vi.mock("../../tol-ui/src", async () => {
  const { Form } = await import("rsuite");
  return {
    RSForm: Form,
    FormComponentWrapper: ({ children, automatic, recommended }: {
      children: ReactNode;
      automatic?: boolean;
      recommended?: boolean;
    }) => (
      <div>
        {automatic && <span>Auto-generated</span>}
        {recommended && <span>Recommended</span>}
        {children}
      </div>
    ),
  };
});

describe("FormTextField control props", () => {
  test("keeps form metadata on the wrapper rather than the input", () => {
    const onChange = vi.fn();
    render(
      <FormTextField
        id="title"
        name="title"
        automatic
        recommended
        requiredAsText
        section="general"
        multiple
        minOne
        onMinus={vi.fn()}
        rowButton={() => ({ text: "Action" })}
        readOnly
        required
        value="Existing title"
        placeholder="Enter a title"
        onChange={onChange}
      />,
    );

    const input = screen.getByRole("textbox");
    for (const attribute of [
      "automatic", "recommended", "requiredAsText", "section",
      "multiple", "minOne", "onMinus", "rowButton",
    ]) {
      expect(input).not.toHaveAttribute(attribute);
    }
    expect(screen.getByText("Auto-generated")).toBeInTheDocument();
    expect(screen.getByText("Recommended")).toBeInTheDocument();
    expect(input).toHaveValue("Existing title");
    expect(input).toHaveAttribute("readonly");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("placeholder", "Enter a title");
  });
});
