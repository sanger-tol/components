/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch, useEffect, useState } from "react";
import { TOL_DS, API_METHODS, Button, Widgets } from "../tol-ui/src";
import { Progress } from "rsuite";
import * as XLSX from "xlsx";

import { IGetList } from "../tol-ui/src";

interface IProgressThreshold {
  setTotal: Dispatch<React.SetStateAction<number>>;
  setCurrent: Dispatch<React.SetStateAction<number>>;
  setPercentageComplete: Dispatch<React.SetStateAction<number>>;
}

async function cursorObjectList(
  { objectType = "manifest", filter, requestedFields }: IGetList,
  { setTotal, setCurrent, setPercentageComplete }: IProgressThreshold
) {
  const results: any[] = [];
  setTotal(0);
  setCurrent(0);
  setPercentageComplete(0);
  return TOL_DS.custom({
    method: API_METHODS.GET,
    resource: objectType,
  }).then(async (response) => {
    const tl = response.data.meta.total;
    setTotal(tl);
    const ds = TOL_DS.getListByCursor({
      objectType: objectType,
      filter: filter,
      requestedFields: requestedFields,
    });
    for await (const item of ds) {
      setCurrent((prev) => {
        const next = prev + 1;
        setPercentageComplete(Math.round((next / tl) * 100));
        results.push(item);
        return next;
      });
    }
    return results;
  });
}

function exportDataToSpreadsheet({ results }) {
  console.log("Here bouy-->", results);
  const worksheet = XLSX.utils.json_to_sheet(results);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dates");
  XLSX.writeFile(workbook, "Presidents.xlsx", { compression: true });
}

export function Sandbox() {
  const [total, setTotal] = useState<number>(0);
  const [current, setCurrent] = useState<number>(0);
  const [percentageComplete, setPercentageComplete] = useState<number>(0);

  const downloadSpreadsheet = async () => {
    await cursorObjectList(
      { objectType: "manifest" },
      { setTotal, setCurrent, setPercentageComplete }
    ).then((response) => {
      console.log("here bouy--> ", response);
    });
  };

  const Contents = (
    <>
      <Button
        onClick={() => {
          downloadSpreadsheet();
        }}
        text="Get Manifest Data"
      />
      <Progress.Line
        percent={percentageComplete}
        status={percentageComplete === 100 ? "success" : "active"}
      />
      <div style={{ width: 100 }}>
        <Progress.Circle
          percent={percentageComplete}
          status={percentageComplete === 100 ? "success" : "active"}
        />
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
