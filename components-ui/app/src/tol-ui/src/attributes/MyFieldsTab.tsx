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
    <div className="tol-attribute-selector-my-fields-tab">
      <Button
        className="tol-attribute-selector-advanced-search-tab__new-field-button"
        testid="create-custom-field-button"
        type="success"
        icon="plus"
        text="New Field"
        loading={loading}
        disabled={loading}
      />
      <div className="tol-attribute-selector-advanced-search-tab__field-list">
        
      </div>
    </div>
  );
}
