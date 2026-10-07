/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Timeline } from "../tol-ui/src";
import type { IFieldMeta, IFieldTimeline } from "../tol-ui/src";

/** Simple timeline example with date ordering and visibility controls. */
export function Sandbox() {
  const [endless, setEndless] = useState(false);
  const [hideUndefined, setHideUndefined] = useState(false);
  const [hideFuture, setHideFuture] = useState(false);
  const [hidePast, setHidePast] = useState(false);
  const [showDescription, setShowDescription] = useState(true);

  const fields: IFieldMeta & { data: Record<string, IFieldTimeline> } = {
    order: { active: ["sequenced", "received", "planned", "submitted"] },
    data: {
      sequenced: { rename: "Sequenced", color: "var(--tol-primary)" },
      received: {
        rename: "Sample received",
        description: "The sample arrived at Sanger.",
        color: "var(--tol-success)",
      },
      planned: { rename: "Planned review", color: "var(--tol-warning)" },
      submitted: { rename: "Submission date" },
    },
  };
  const data = {
    sequenced: "2027-01-03T12:00:00Z",
    received: "2026-01-01T12:00:00Z",
    planned: "2099-01-01T12:00:00Z",
    submitted: undefined,
  };

  return (
    <section className="p-3">
      <h2>Timeline sandbox</h2>
      <div className="d-flex flex-wrap gap-3 mb-3">
        <label><input type="checkbox" checked={endless} onChange={(event) => setEndless(event.target.checked)} /> Endless</label>
        <label><input type="checkbox" checked={hideUndefined} onChange={(event) => setHideUndefined(event.target.checked)} /> Hide undefined</label>
        <label><input type="checkbox" checked={hideFuture} onChange={(event) => setHideFuture(event.target.checked)} /> Hide future</label>
        <label><input type="checkbox" checked={hidePast} onChange={(event) => setHidePast(event.target.checked)} /> Hide past</label>
        <label><input type="checkbox" checked={showDescription} onChange={(event) => setShowDescription(event.target.checked)} /> Show descriptions</label>
      </div>
      <Timeline
        id="sandbox-timeline"
        fields={fields}
        data={data}
        height="auto"
        endless={endless}
        hideUndefined={hideUndefined}
        hideFuture={hideFuture}
        hidePast={hidePast}
        showDescription={showDescription}
      />
    </section>
  );
}
