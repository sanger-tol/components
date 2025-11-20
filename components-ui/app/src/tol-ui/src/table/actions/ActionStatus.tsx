/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  StatusMessage,
  TsDataSource,
  Placeholder,
  PCell,
  env,
  PREFECT_API_DATA_PATH
} from "../..";


export function ActionStatus(props: PCell) {
  // inherits from PCell which sets dataObject as TDataObjectOrNull, assume not null here
  const flowRunId = props.dataObject?.params.flow_run_id;
  const flowRunName = props.dataObject?.params.flow_run_name;
  const localStatus = props.dataObject?.params.status;
  const RELOAD_INTERVAL = 10;
  const [status, setStatus] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [secondsSinceLastUpdate, setSecondsSinceLastUpdate] = useState(0);

  const convertFlowToMessageStatus = (s: string) => {
    switch (s) {
      case "Scheduled":
        return "warning";
      case "Pending":
        return "warning";
      case "Completed":
        return "success";
      case "Failed":
        return "error";
      default:
        return "info";
    }
  }

  const getActionStatus = async () => {
    setLoading(true);
    const ds = new TsDataSource({
      apiPath: env.API_PATH,
      apiDataPath: PREFECT_API_DATA_PATH,
    });
    return await ds.getOne({
      objectType: "flow_run",
      id: flowRunId,
    })
  }

  useEffect(() => {
    if (!localStatus) {
      const intervalId = setInterval(() => {
        setSecondsSinceLastUpdate((prevSeconds) => {
          if (prevSeconds === 0) {
            getActionStatus()
              .then((dataObject) => {
                if (!dataObject) setError(`Failed to fetch status: ${flowRunId}`);
                const state = dataObject?.state;
                setStatus(state);
                setLoading(false);
                setInitialLoad(false);
                if (state === "Completed" || state === "Failed") {
                  clearInterval(intervalId);
                }
              })
              .catch((e) => {
                setError(`Failed to fetch status: ${e.message}`);
                setLoading(false);
                setInitialLoad(false);
              });
            return RELOAD_INTERVAL;
          }
          return prevSeconds - 1;
        });
      }, 1000);

      return () => clearInterval(intervalId); // cleanup interval on component unmount
    } else {
      if (Object.keys(localStatus[0]).includes('success')) {
        setStatus('Completed');
      } else {
        setStatus('Failed');
      }
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  if (error) {
    return (
      <StatusMessage
        message={error}
        status="error"
      />
    );
  }

  if (initialLoad) {
    return <Placeholder loader height={60} />;
  }

  return (
    <div>
      {flowRunId && (
        <>
          <div>
            <span style={{ fontWeight: 'bolder' }}>Flow Run Name: </span>
            <span>{flowRunName}</span>
          </div>
          <div>
            <span style={{ fontWeight: 'bolder' }}>Flow Run ID: </span>
            <span>{flowRunId}</span>
          </div>
        </>
      )}

      <div>
        {loading ?
          <Placeholder height={28} />
          :
          <div>
            <StatusMessage
              message={status}
              status={convertFlowToMessageStatus(status)}
            />
            {(status !== "Completed" && status !== 'Failed') && (
              <>Refreshing in {secondsSinceLastUpdate}...</>
            )}
          </div>
        }
      </div>
    </div>
  );
}
