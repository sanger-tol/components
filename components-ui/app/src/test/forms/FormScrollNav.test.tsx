/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  FormAllInOne,
  FormSideNavBar,
  cleanTitle,
  findScrollContainer,
  getFieldStatus,
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

  test("computes statuses from flags, values and validation errors", () => {
    const field: TFormField = { name: "title", type: "text", required: true };
    const context = { formLocked: false, sectionLocked: false };
    expect(getFieldStatus(field, "", context)).toBe("required");
    expect(getFieldStatus(field, "Title", context)).toBe("complete");
    expect(getFieldStatus(field, "Title", { ...context, error: "Invalid" })).toBe("error");
    expect(getFieldStatus(field, "", { ...context, sectionLocked: true })).toBe("locked");
    expect(getFieldStatus({ ...field, automatic: true }, "", { ...context, formLocked: true })).toBe("auto");
    expect(getFieldStatus({ ...field, multiple: true }, { row: "" }, context)).toBe("required");
    expect(getFieldStatus(field, [""], context)).toBe("required");
    expect(getFieldStatus(field, ["", "value"], context)).toBe("complete");
  });

  test("summarises only visible fields and does not change scroll item indices", () => {
    const fields: TFormField[] = [
      { name: "hidden", type: "checkbox", label: "Hidden", hidden: true, checkboxConfig: { fields: [] }, section: "general" },
      { name: "title", type: "text", required: true, section: "general" },
      { name: "abstract", type: "text", required: true, section: "general" },
    ];
    const groups = getNavGroups(fields, [], (field) =>
      getFieldStatus(field, "", { formLocked: false }),
    );
    expect(groups[0].fields.map((field) => field.name)).toEqual(["title", "abstract"]);
    expect(groups[0].status).toEqual({ kind: "remaining", count: 2 });
    expect(getNavItems(groups)[0].index).toBe(1);
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

  test("updates field and section statuses as values change", () => {
    const formConfig: IFormConfig = {
      fields: [
        { name: "doi", label: "DOI", type: "text", section: "general", automatic: true },
        { name: "title", label: "Title", type: "text", section: "general", required: true },
        { name: "abstract", label: "Abstract", type: "text", section: "general", required: true },
        { name: "funding", label: "Funding source", type: "text", section: "funding" },
      ],
      sections: [{ id: "funding", optional: true }],
      options: { scrollNav: { defaultOpen: true } },
    };
    const history = createMemoryHistory();
    const { container } = render(
      <Router history={history}>
        <FormAllInOne formConfig={formConfig} />
      </Router>,
    );
    const nav = within(container.querySelector("nav.tol-form-sidenav")!);
    const progress = nav.getByRole("progressbar", { name: "0 of 2 required fields complete" });
    expect(progress.getAttribute("value")).toBe("0");
    expect(progress.getAttribute("max")).toBe("2");
    expect(container.querySelector(".tol-form-sidenav-groups")!.contains(progress)).toBe(false);
    expect(nav.getByRole("button", { name: /General 2 fields remaining/ })).toBeTruthy();
    expect(nav.getByRole("button", { name: /DOI Auto-generated/ })).toBeTruthy();
    expect(nav.getByRole("button", { name: /Funding Optional/ })).toBeTruthy();
    expect(nav.getByRole("button", { name: /DOI Auto-generated/ })
      .querySelector('.tol-icon svg[data-icon="robot"]')).toBeTruthy();
    expect(nav.getByRole("button", { name: /Title Required/ })
      .querySelector('.tol-icon svg[data-icon="circle"]')).toBeTruthy();
    fireEvent.change(container.querySelector('input[name="title"]')!, {
      target: { value: "A title" },
    });
    expect(nav.getByRole("button", { name: /General 1 field remaining/ })).toBeTruthy();
    expect(nav.getByRole("progressbar", { name: "1 of 2 required fields complete" })
      .getAttribute("value")).toBe("1");
    expect(nav.getByRole("button", { name: /Title Provided/ })).toBeTruthy();
    expect(nav.getByRole("button", { name: /Title Provided/ })
      .querySelector('.tol-icon svg[data-icon="check"]')).toBeTruthy();
    fireEvent.change(container.querySelector('input[name="abstract"]')!, {
      target: { value: "An abstract" },
    });
    expect(nav.getByRole("progressbar", { name: "2 of 2 required fields complete" })
      .getAttribute("value")).toBe("2");
  });

  test("marks required fields complete despite auto and missing recommended fields", () => {
    const formConfig: IFormConfig = {
      fields: [
        { name: "doi", label: "DOI", type: "text", section: "general", automatic: true },
        { name: "title", label: "Title", type: "text", section: "general", required: true },
        { name: "notes", label: "Notes", type: "text", section: "general" },
        { name: "abstract", label: "Abstract", type: "text", section: "general", recommended: true },
      ],
      options: { scrollNav: { defaultOpen: true } },
    };
    const { container } = render(
      <Router history={createMemoryHistory()}>
        <FormAllInOne formConfig={formConfig} />
      </Router>,
    );
    const nav = within(container.querySelector("nav.tol-form-sidenav")!);
    expect(nav.getByRole("button", { name: /General 1 field remaining/ })).toBeTruthy();
    fireEvent.change(container.querySelector('input[name="title"]')!, {
      target: { value: "Title" },
    });
    expect(nav.getByRole("button", {
      name: /General Complete, 1 recommended field missing/,
    })).toBeTruthy();
    expect(nav.getByRole("progressbar", { name: "1 of 1 required fields complete" })).toBeTruthy();
    fireEvent.change(container.querySelector('input[name="abstract"]')!, {
      target: { value: "Abstract" },
    });
    expect(nav.getByRole("button", { name: "General Complete" })).toBeTruthy();
  });

  test("counts only visible, editable required fields in progress", () => {
    const fields: TFormField[] = [
      { name: "title", type: "text", required: true },
      { name: "authors", type: "text", multiple: true, minOne: true },
      { name: "automatic", type: "text", required: true, automatic: true },
      { name: "locked", type: "text", required: true, readOnly: true },
      { name: "hidden", type: "checkbox", label: "Hidden", required: true, hidden: true, checkboxConfig: { fields: [] } },
      { name: "optional", type: "text" },
    ];
    const groups = getNavGroups(fields, [], (field) =>
      getFieldStatus(field, field.name === "title" ? "Done" : "", { formLocked: false }),
    );
    const { rerender } = render(<FormSideNavBar groups={groups} onSelect={vi.fn()} />);
    expect(screen.getByRole("progressbar", { name: "1 of 2 required fields complete" })).toBeTruthy();
    rerender(<FormSideNavBar groups={getNavGroups(fields)} onSelect={vi.fn()} />);
    expect(screen.queryByRole("progressbar")).toBeNull();
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
