/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Button, FormTextField } from "../..";
import type { IFormSearchConfig } from "../..";

/** Props for the lookup controls shown before a search-first form. */
export interface PFormSearchControls<TResult extends object> {
  /** Search labels, messages and callbacks. */
  config: IFormSearchConfig<TResult>;
  /** Unique id of the form, used for the search input id. */
  formId: string;
  /** Disables the controls, for example when the form is locked. */
  disabled: boolean;
  /** Called with a successful search result. */
  onResult: (result: TResult) => void;
  /** Called when the user chooses to fill the form in manually. */
  onManualEntry: () => void;
}

// Search-first lookup that prefills a form, with a way to skip to manual entry.
export function FormSearchControls<TResult extends object>(
  props: PFormSearchControls<TResult>,
) {
  const { config, disabled, formId, onManualEntry, onResult } = props;

  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    const trimmedQuery = query.trim();
    setError("");

    if (!trimmedQuery) {
      setError(config.emptySearchMessage ?? "Enter a search term.");
      return;
    }

    setSearching(true);
    config.onSearchStateChange?.(true);

    Promise.resolve()
      .then(() => config.onSearch(trimmedQuery))
      .then((result) => {
        onResult(result);
        config.onSearchResult?.(result);
      })
      .catch((searchError: unknown) => {
        setError(
          searchError instanceof Error && searchError.message
            ? searchError.message
            : config.searchErrorMessage,
        );
      })
      .finally(() => {
        setSearching(false);
        config.onSearchStateChange?.(false);
      });
  };

  return (
    <div className="tol-form-search-controls">
      <FormTextField
        id={`${formId}-search`}
        name="search"
        type="text"
        label={config.searchLabel}
        placeholder={config.searchPlaceholder}
        value={query}
        readOnly={disabled}
        onChange={setQuery}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleSearch();
          }
        }}
      />

      {error && (
        <p className="tol-form-search-error" role="alert">
          {error}
        </p>
      )}

      <div className="tol-form-search-actions">
        <Button
          text={config.manualEntryButtonText}
          disabled={searching || disabled}
          onClick={() => {
            setError("");
            onManualEntry();
            config.onManualEntry?.();
          }}
        />
        <Button
          text={config.searchButtonText}
          icon="search"
          loading={searching}
          disabled={searching || disabled}
          onClick={handleSearch}
        />
      </div>
    </div>
  );
}
