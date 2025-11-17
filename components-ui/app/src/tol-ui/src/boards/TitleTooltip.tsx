/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReadOnlyFilters } from "src/attributes";

interface PTitleTooltip {
  title: string;
  objectType: string;
  filters: JSX.Element;
  description: string;
}

export function TitleTooltip(props: PTitleTooltip) {
  const { title, objectType, filters, description } = props;

  return (
    <div>
      {description}
    </div>
  )
}
