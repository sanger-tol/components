/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { ReactNode, MouseEventHandler } from "react";
import { FormAllInOne } from "../../tol-ui/src/forms/FormAllInOne";
import type {
  IFormConfig,
  IFormSearchConfig,
} from "../../tol-ui/src/interfaces/forms/Forms";

type TLookupResult = {
  title: string;
};

vi.mock("../../tol-ui/src", async () => {
  const { Form } = await import("rsuite");
  return {
    RSForm: Form,
    FormTextField: ({ label, name, value, onChange, errorText }: {
      label: string;
      name: string;
      value: string;
      onChange: (value: string) => void;
      errorText?: string;
    }) => <label>{label}<input name={name} value={value}
      onChange={(event) => onChange(event.target.value)} />
      {errorText && <span>{errorText}</span>}</label>,
    Button: ({ text, onClick, disabled }: {
      text: ReactNode;
      onClick: MouseEventHandler<HTMLButtonElement>;
      disabled?: boolean;
    }) => <button type="button" onClick={onClick} disabled={disabled}>{text}</button>,
    createInitialDataSnapshot: (config: IFormConfig, initialData?: object) =>
      Object.fromEntries(config.fields.map((field) => [
        field.name,
        (initialData as Record<string, unknown> | undefined)?.[field.name] ?? "",
      ])),
    deepestEqual: (first: unknown, second: unknown) =>
      JSON.stringify(first) === JSON.stringify(second),
    normaliseCaps: (value: string) => value,
    validateForm: (_formRef: unknown, data: object, onSubmit?: (data: object, valid: boolean) => void) => {
      onSubmit?.(data, true);
      return true;
    },
  };
});

const FORM_CONFIG: IFormConfig = {
  fields: [
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
    },
  ],
};

function createSearchConfig(
  overrides: Partial<IFormSearchConfig<TLookupResult>> = {},
): IFormSearchConfig<TLookupResult> {
  return {
    searchLabel: "Search DOI",
    searchPlaceholder: "Enter a DOI",
    searchButtonText: "Search",
    manualEntryButtonText: "Enter manually",
    emptySearchMessage: "Enter a DOI.",
    searchErrorMessage: "Search failed.",
    onSearch: vi.fn().mockResolvedValue({ title: "Found reference" }),
    ...overrides,
  };
}

describe("FormAllInOne search mode", () => {
  beforeEach(() => {
    vi.stubGlobal("crypto", { randomUUID: () => "test-form" });
  });

  afterEach(() => vi.unstubAllGlobals());

  test("keeps ordinary forms visible when search is not configured", () => {
    render(<FormAllInOne formConfig={FORM_CONFIG} initialData={{ title: "Existing" }} />);
    expect(screen.getByLabelText("Title")).toHaveValue("Existing");
    expect(screen.queryByRole("button", { name: "Search" })).not.toBeInTheDocument();
  });

  test("does not request a record for an empty query", () => {
    const onSearch = vi.fn();
    render(<FormAllInOne formConfig={FORM_CONFIG} searchConfig={createSearchConfig({ onSearch })} />);
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(screen.getByText("Enter a DOI.")).toBeInTheDocument();
    expect(onSearch).not.toHaveBeenCalled();
  });

  test("renders the search control inside the RSuite form context", () => {
    render(
      <FormAllInOne
        formConfig={FORM_CONFIG}
        searchConfig={createSearchConfig()}
      />,
    );

    expect(screen.getByLabelText("Search DOI").closest("form")).not.toBeNull();
  });

  test("reveals the manual fields when manual entry is selected", () => {
    render(
      <FormAllInOne
        formConfig={FORM_CONFIG}
        searchConfig={createSearchConfig()}
      />,
    );

    expect(screen.queryByLabelText("Title")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Enter manually" }));
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
  });

  test("prefills the same form with successful search results", async () => {
    const onSearch = vi.fn().mockResolvedValue({ title: "Found reference" });
    const onSearchResult = vi.fn();

    render(
      <FormAllInOne
        formConfig={FORM_CONFIG}
        searchConfig={createSearchConfig({ onSearch, onSearchResult })}
      />,
    );

    fireEvent.change(screen.getByLabelText("Search DOI"), {
      target: { value: "10.1234/example" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toHaveValue("Found reference");
    });
    expect(onSearch).toHaveBeenCalledWith("10.1234/example");
    expect(onSearchResult).toHaveBeenCalledWith({ title: "Found reference" });
  });

  test("shows a search error and leaves search mode available", async () => {
    render(
      <FormAllInOne
        formConfig={FORM_CONFIG}
        searchConfig={createSearchConfig({
          onSearch: vi.fn().mockRejectedValue(new Error("DOI not found.")),
        })}
      />,
    );

    fireEvent.change(screen.getByLabelText("Search DOI"), {
      target: { value: "10.1234/missing" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByText("DOI not found.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enter manually" })).toBeInTheDocument();
  });
});
