/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  FormAllInOne,
  cleanTitle,
  findScrollContainer,
  getFieldAnchorId,
  getNavGroups,
  getNavItems,
  getScrollContainerId,
  getScrollSpyOffset,
  prettify,
  resolveScrollNavConfig,
  withFieldAnchorIds,
} from "../../tol-ui/src";
import type { IFormConfig, TFormField } from "../../tol-ui/src";

const FIELDS: TFormField[] = [
  { name: "doi", label: "DOI:", type: "text", section: "general" },
  { name: "title", label: "Title", type: "text", section: "general" },
  { name: "funding_source", type: "text", section: "funding" },
  { name: "notes", label: "Notes", type: "text" },
];

describe("scroll nav utils", () => {
  test("builds anchor and container ids", () => {
    expect(getFieldAnchorId("metadata", "general", "doi", 0)).toBe(
      "tol-form-metadata-general-doi-0",
    );
    expect(getScrollContainerId("metadata")).toBe("tol-form-scroll-metadata");
  });

  test("cleans and prettifies labels", () => {
    expect(cleanTitle("  Data: Availability:  ")).toBe("Data Availability");
    expect(prettify("funding_source:")).toBe("Funding Source");
  });

  test("resolves the scrollNav option with defaults", () => {
    expect(resolveScrollNavConfig(undefined)).toBeUndefined();
    expect(resolveScrollNavConfig(false)).toBeUndefined();
    expect(resolveScrollNavConfig({ enabled: false })).toBeUndefined();
    expect(resolveScrollNavConfig(true)).toEqual({
      key: "form",
      active: true,
      syncUrl: true,
      sectionParam: "s",
      subSectionParam: "sub",
    });
    expect(
      resolveScrollNavConfig({ key: "metadata", subSectionParam: "part" }),
    ).toMatchObject({ key: "metadata", subSectionParam: "part" });
  });

  test("assigns anchor ids while keeping explicit ids", () => {
    const fields = withFieldAnchorIds(
      [...FIELDS, { name: "custom", type: "text", id: "my-id" }],
      "metadata",
    );
    expect(fields.map((field) => field.id)).toEqual([
      "tol-form-metadata-general-doi-0",
      "tol-form-metadata-general-title-1",
      "tol-form-metadata-funding-funding_source-2",
      "tol-form-metadata-misc-notes-3",
      "my-id",
    ]);
  });

  test("groups fields in render order with misc last", () => {
    const fields = withFieldAnchorIds(
      [FIELDS[3], ...FIELDS.slice(0, 3)],
      "metadata",
    );
    const groups = getNavGroups(fields, [{ id: "funding", label: "Money" }]);
    expect(groups.map((group) => group.subSection)).toEqual([
      "general",
      "funding",
      "misc",
    ]);
    expect(groups[0].fields.map((field) => field.label)).toEqual([
      "DOI",
      "Title",
    ]);
    expect(groups[1].label).toBe("Money");
    expect(groups[1].fields[0].label).toBe("Funding Source");

    expect(getNavItems(groups)[0]).toEqual({
      anchorId: "tol-form-metadata-general-doi-1",
      subSection: "general",
      field: "doi",
      index: 1,
    });
  });

  test("computes a capped scroll-spy offset", () => {
    expect(getScrollSpyOffset({ clientHeight: 200 } as HTMLDivElement)).toBe(50);
    expect(getScrollSpyOffset({ clientHeight: 2000 } as HTMLDivElement)).toBe(
      120,
    );
  });

  test("finds a mounted scroll container", () => {
    const container = document.createElement("div");
    container.id = "tol-form-scroll-x";
    document.body.appendChild(container);
    expect(findScrollContainer("tol-form-scroll-x")).toBe(container);
    container.remove();
    expect(findScrollContainer("tol-form-scroll-x")).toBeNull();
  });
});

describe("FormAllInOne scroll nav", () => {
  const scrollTo = vi.fn();

  // Setup runs in animation frames; act() flushes the resulting effects.
  const settle = () =>
    act(() => new Promise<void>((resolve) => setTimeout(resolve, 50)));

  beforeEach(() => {
    Element.prototype.scrollTo = scrollTo;
  });

  afterEach(() => {
    scrollTo.mockReset();
  });

  const renderForm = (
    scrollNav: NonNullable<IFormConfig["options"]>["scrollNav"],
    initialEntry = "/",
  ) => {
    const history = createMemoryHistory({ initialEntries: [initialEntry] });
    const formConfig: IFormConfig = {
      fields: FIELDS.slice(0, 3),
      options: { scrollNav },
    };
    const view = render(
      <Router history={history}>
        <FormAllInOne formConfig={formConfig} footer={<div>Footer</div>} />
      </Router>,
    );
    return { history, view };
  };

  test("renders a plain form when scroll nav is disabled", () => {
    renderForm(false);
    expect(screen.queryByText("ON THIS PAGE")).toBeNull();
    expect(screen.queryByText("Footer")).toBeNull();
  });

  test("renders the titled layout, side nav and scroll container", () => {
    const { view } = renderForm({ key: "metadata", title: "Metadata" });
    expect(screen.getByRole("heading", { name: "Metadata" })).toBeTruthy();
    expect(screen.getByText("ON THIS PAGE")).toBeTruthy();
    expect(screen.getByText("Footer")).toBeTruthy();
    expect(
      view.container.querySelector("#tol-form-scroll-metadata"),
    ).not.toBeNull();
    expect(
      view.container.querySelector("#tol-form-metadata-general-doi-0"),
    ).not.toBeNull();
  });

  test("syncs the section and sub-section to the URL", async () => {
    const { history } = renderForm({ key: "metadata" });
    // jsdom has no layout, so the initial sub-section is arbitrary.
    await settle();
    expect(history.location.search).toMatch(/^\?s=metadata&sub=\w+$/);

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "General" }));
    });
    await settle();
    expect(history.location.search).toBe("?s=metadata&sub=general");

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Funding" }));
    });
    await settle();
    expect(history.location.search).toBe("?s=metadata&sub=funding");
    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "smooth" }),
    );
  });

  test("uses custom query params", async () => {
    const { history } = renderForm({
      key: "metadata",
      sectionParam: "tab",
      subSectionParam: "part",
    });
    await settle();
    expect(history.location.search).toMatch(/^\?tab=metadata&part=\w+$/);
  });

  test("restores a deep-linked sub-section", async () => {
    const { history } = renderForm(
      { key: "metadata" },
      "/?s=metadata&sub=general",
    );
    await waitFor(() =>
      expect(scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: "auto" }),
      ),
    );
    await settle();
    expect(history.location.search).toBe("?s=metadata&sub=general");
  });

  test("leaves the URL alone while inactive", async () => {
    const { history } = renderForm({ key: "metadata", active: false });
    await settle();
    expect(history.location.search).toBe("");
  });
});
