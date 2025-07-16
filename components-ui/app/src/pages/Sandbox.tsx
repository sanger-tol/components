/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { TOL_DS, API_METHODS, Button, Widgets } from "../tol-ui/src";
import { Progress } from "rsuite";

export function Sandbox() {
  const [total, setTotal] = useState<number>(0);
  const [current, setCurrent] = useState<number>(0);
  const [percentageComplete, setPercentageComplete] = useState<number>(0);

  const getResults = async () => {
    setTotal(0);
    setCurrent(0);
    setPercentageComplete(0);
    TOL_DS.custom({
      method: API_METHODS.GET,
      resource: "manifest",
    }).then(async (response) => {
      const tl = response.data.meta.total;
      setTotal(tl);
      const ds = TOL_DS.getListByCursor({ objectType: "manifest" });
      for await (const _ of ds) {
        setCurrent((prev) => {
          const next = prev + 1;
          setPercentageComplete(Math.round((next / tl) * 100));
          return next;
        });
      }
    });
  };

  const Contents = (
    <>
      <Button onClick={getResults} text="Get Manifest Data" />
      <Progress.Line percent={percentageComplete} status={percentageComplete === 100 ? 'success' : 'active'} />
      <div style={{ width: 100 }}>
        <Progress.Circle percent={percentageComplete} status={percentageComplete === 100 ? 'success' : 'active'} />
      </div>
      {`${current}/${total} Manifest Results`}
    </>
  );

  const components = [
    {
      component: Contents,
      type: "full",
    },
  ];

  return <Widgets components={components} />;
}
