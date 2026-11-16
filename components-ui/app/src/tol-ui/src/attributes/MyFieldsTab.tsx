/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";

import { Button } from "..";

export interface PMyFieldsTab {

}

export function MyFieldsTab() {
  const [customFields, setCustomFields] = useState<string[] | undefined>();

  const loading = customFields === undefined;

  return (
    <div>
      <Button
        className="tol-create-custom-field-button"
        testid="create-custom-field-button"
        type="success"
        icon="plus"
        text="New Field"
        loading={loading}
        disabled={loading}
      />
    </div>
  );
}
