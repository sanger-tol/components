/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { API_METHODS, TOL_DS } from "../tol-ui/src";

export function Sandbox() {
  TOL_DS
    .custom({
      method: API_METHODS.POST,
      resource: "species:cursor",
      body: {},
      // body: {
      //   search_after: ["1000415"]
      // }
    })
    .then((response) => {
      console.log("Response from custom API call:", response);
    })
    .catch((error) => {
      console.error("Error in custom API call:", error);
    });

  return <></>;
}
