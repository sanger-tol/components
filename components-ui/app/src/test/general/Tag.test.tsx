/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { Tag } from "../../tol-ui/src";


describe("Tag", () => {
  test("renders the supplied icon before its content", () => {
    render(<Tag icon="check">Complete</Tag>);

    const tag = screen.getByText("Complete");
    const icon = tag.querySelector('[data-icon="check"]');

    expect(icon).toBeInTheDocument();
    expect(tag.firstElementChild).toContainElement(icon);
  });

  test("shows the supplied tooltip when hovered", async () => {
    const user = userEvent.setup();

    render(<Tag tooltip="Tag information">Hover me</Tag>);
    await user.hover(screen.getByText("Hover me"));

    expect(await screen.findByText("Tag information")).toBeInTheDocument();
  });
});
