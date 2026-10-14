/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  StatusMessage,
  TsDataSource,
  Placeholder,
  API_PATHS,
  PCellDisplay
} from "../..";


export function ActionStatus(props: PCellDisplay) {
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

  useEffect(() => {
    if (localStatus) {
      if (Object.keys(localStatus[0] ?? {}).includes("success")) {
        setStatus("Completed");
      } else {
        setStatus("Failed");
      }
      setLoading(false);
      setInitialLoad(false);
      return;
    }

    if (!flowRunId) {
      setError("Cannot fetch flow status: missing flow run ID");
      setLoading(false);
      setInitialLoad(false);
      return;
    }

    let active = true;
    let requestInProgress = false;
    let secondsUntilReload = 0;
    let intervalId: ReturnType<typeof setInterval>;

    const fetchStatus = async () => {
      if (!active || requestInProgress) return;
      requestInProgress = true;
      setLoading(true);

      try {
        const dataSource = new TsDataSource({
          apiPath: API_PATHS.API_PATH,
          apiDataPath: API_PATHS.PREFECT,
        });
        const dataObject = await dataSource.getOne({
          objectType: "flow_run",
          id: flowRunId,
        });
        const state = dataObject?.state;

        if (!state) {
          throw new Error(`No flow status returned for ${flowRunId}`);
        }

        if (!active) return;
        setStatus(state);
        setInitialLoad(false);

        if (state === "Completed" || state === "Failed") {
          clearInterval(intervalId);
        } else {
          secondsUntilReload = RELOAD_INTERVAL;
          setSecondsSinceLastUpdate(RELOAD_INTERVAL);
        }
      } catch (e) {
        if (!active) return;
        setError(`Failed to fetch status: ${e instanceof Error ? e.message : String(e)}`);
        setInitialLoad(false);
        clearInterval(intervalId);
      } finally {
        requestInProgress = false;
        if (active) setLoading(false);
      }
    };

    intervalId = setInterval(() => {
      if (secondsUntilReload === 0) {
        // Keep network work outside the React state updater; updater callbacks must stay pure.
        void fetchStatus();
      } else {
        secondsUntilReload -= 1;
        setSecondsSinceLastUpdate(secondsUntilReload);
      }
    }, 1000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [flowRunId, localStatus]);

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
