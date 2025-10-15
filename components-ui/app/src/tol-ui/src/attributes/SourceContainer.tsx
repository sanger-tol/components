/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { 
  SourceTag,
  filterBySource,
} from "..";

export interface PSourceContainer { 
  sources: string[];
  selectedSources: string[];
  setSelectedSources: (sources: string[]) => void;
}

export function SourceContainer(props: PSourceContainer) {
  const { sources, selectedSources, setSelectedSources } = props;
  const hasActiveSource = selectedSources.length > 0;

  return (
    <div className="tol-attribute-selector-search-by-source-container">
      <p>Filter by source:</p>
      <div className="tol-attribute-selector-sources">
        {sources.map((source: string, index: number) => (
          <div
            key={index}
            className="tol-attribute-selector-sources-inner-container"
            onClick={() =>
              filterBySource(source, selectedSources, setSelectedSources)
            }
          >
            <SourceTag
              source={source}
              className={`${selectedSources.includes(source) ? "active" : ""
                } ${hasActiveSource && !selectedSources.includes(source)
                  ? "faded"
                  : ""
                }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}