/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { env, IAppEnvironment } from "..";

function assumeProduction(): string {
  console.warn("Error fetching environment. Assuming production.");
  return "production";
};

export async function fetchEnvironment(): Promise<string> {
  return fetch(env.API_PATH + "/system/environment")
    .then((res) => {
      if (res.ok) {
        return res.json() as Promise<IAppEnvironment>;
      }
      return null;
    })
    .then((res: IAppEnvironment | null) => {
      if (!res?.environment) {
        return assumeProduction();
      }
      return res.environment;
    })
    .catch(() => {
      return assumeProduction();
    });
};

export function getBackgroundClass(environment: string): string {
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

export function isProduction(environment: string): boolean {
  return environment === "production";
};

export function revokeOicd(token: string) {
  fetch(env.API_PATH + "/auth/logout", {
    body: JSON.stringify({ token: token }),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
};
