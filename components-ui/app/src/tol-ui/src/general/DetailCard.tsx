/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { ReactNode } from "react";

import type { IDetailCardField } from "..";

export interface PDetailCard {
  /** Card heading. */
  title?: ReactNode;
  /** Supporting text displayed below the heading. */
  description?: ReactNode;
  /** Structured label-value details. Nullish values are omitted. */
  fields?: IDetailCardField[];
  /** Additional card content. */
  children?: ReactNode;
}

/**
 * @autodoc
 *
 * Displays structured details in a consistent, natural-height card.
 */
export function DetailCard({
  title,
  description,
  fields = [],
  children,
}: PDetailCard) {
  const visibleFields = fields.filter(
    ({ value }) => value !== undefined && value !== null,
  );

  return (
    <div className="tol-detail-card">
      {(title || description) && (
        <div className="tol-detail-card__header">
          {title && <h3>{title}</h3>}
          {description && <p>{description}</p>}
        </div>
      )}
      {visibleFields.length > 0 && (
        <dl className="tol-detail-card__fields">
          {visibleFields.map((field, index) => (
            <div key={field.id ?? index}>
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {children && <div className="tol-detail-card__body">{children}</div>}
    </div>
  );
}
