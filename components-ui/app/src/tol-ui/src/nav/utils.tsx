/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { env } from "..";

export const assumeProduction = (): string => {
  console.warn("Error fetching environment. Assuming production.");
  return "production";
};

export const fetchEnvironment = (): Promise<string> => {
  return fetch(env.API_PATH + "/system/environment")
    .then((res) => {
      if (res.ok) {
        return res.json() as Promise<any>;
      }
      return null;
    })
    .then((res: any) => {
      if (!res?.environment) {
        return assumeProduction();
      }
      return res.environment;
    })
    .catch(() => {
      return assumeProduction();
    });
};

export const getNavBackgroundClass = (environment: string): string => {
  if (environment.startsWith("review")) return "bg-danger";
  switch (environment) {
    case "dev":
    case "testing":
    case "qa":
      return "bg-danger";
    case "staging":
      return "bg-success";
    default:
      return "";
  }
};