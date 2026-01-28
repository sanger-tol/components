/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useContext, createContext } from "react";
import type { TValidationPolicyModule } from "..";

const ValidationModuleContext = createContext<TValidationPolicyModule | null>(null);

export function ValidationModuleProvider({
  module,
  children,
}: {
  module: TValidationPolicyModule;
  children: React.ReactNode;
}) {
  console.log("HI FROM CONTEXT!");
  return (
    <ValidationModuleContext.Provider value={module}>
      {children}
    </ValidationModuleContext.Provider>
  );
}

export function useValidationPolicyModule() {
  const mod = useContext(ValidationModuleContext);
  if (!mod) throw new Error("ValidationModuleProvider is missing.");
  return mod as TValidationPolicyModule;
}
