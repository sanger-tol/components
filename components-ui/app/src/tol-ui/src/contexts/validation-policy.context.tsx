/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useContext, createContext } from "react";
import type { TValidationModule } from "..";

const ValidationModuleContext = createContext<TValidationModule | null>(null);

export function ValidationModuleProvider({
  module,
  children,
}: {
  module: TValidationModule;
  children: React.ReactNode;
}) {
  console.log("HI FROM CONTEXT!");
  return (
    <ValidationModuleContext.Provider value={module}>
      {children}
    </ValidationModuleContext.Provider>
  );
}

export function useValidationModule() {
  const mod = useContext(ValidationModuleContext);
  if (!mod) throw new Error("ValidationModuleProvider is missing.");
  return mod;
}
