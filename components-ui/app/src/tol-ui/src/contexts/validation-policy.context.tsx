/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useContext, createContext } from "react";
import type { TFileValidationPolicyModule } from "..";

const ValidationModuleContext = createContext<TFileValidationPolicyModule | null>(null);

export function ValidationModuleProvider({
  module,
  children,
}: {
  module: TFileValidationPolicyModule;
  children: React.ReactNode;
}) {
  return (
    <ValidationModuleContext.Provider value={module}>
      {children}
    </ValidationModuleContext.Provider>
  );
}

export function useValidationPolicyModule() {
  const mod = useContext(ValidationModuleContext);
  if (!mod) throw new Error("ValidationModuleProvider is missing.");
  return mod as TFileValidationPolicyModule;
}
