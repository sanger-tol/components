/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState } from "react";
import { Button, RSForm } from "..";

export interface PFormComponentMultiples {
  fieldConfig: any;
  label?: string;
  renderField: (fieldConfig: any) => React.ReactNode;
}

export function FormComponentMultiples(props: PFormComponentMultiples) {
  const { fieldConfig, label, renderField } = props;

  const [numElements, setNumElements] = useState<number>(1);

  const addElement = () => {
    setNumElements((prev: number) => prev + 1);
  };

  const removeElement = () => {
    setNumElements((prev: number) => Math.max(prev - 1, 1));
  };

  return (
    <>
      <RSForm.Group>
        <RSForm.ControlLabel>
          {label} {<Button onClick={addElement} text="Add More" />}
        </RSForm.ControlLabel>
        {[...Array(numElements)].map((_, index) => (
          <div key={index}>
            {renderField(fieldConfig)}
          </div>
        ))}
      </RSForm.Group>
    </>
  );
}
