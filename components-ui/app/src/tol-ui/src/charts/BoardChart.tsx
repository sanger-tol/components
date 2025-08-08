/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  BoardFilters,
  Icon,
  Placeholder,
  RemoteBarChart,
  deepCopy,
  saveTitle,
  IBoardTargetAndZone,
  ChartConfigDrawer,
  IChartConfig,
  PButton,
  updateConfigAndUpsert,
  useBoardPrivilege,
  PRIVILEGE
} from "..";


interface Props extends IBoardTargetAndZone {
  id: string;
  title: string;
  config: any;
  size: string;
}

export function BoardChart(props: Props) {
  const { id, title, boardObjectType, boardDataSource, zone } = props;
  const [config, setConfig] = useState<IChartConfig>(props.config);
  const [openFilters, setOpenFilters] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const { privilege } = useBoardPrivilege()

  const onModalSave = (updatedConfig: IChartConfig) => {
    setConfig({ ...updatedConfig });
    updateConfigAndUpsert(
      id,
      { ...updatedConfig },
      zone,
      boardDataSource
    )
    setForceUpdate(!forceUpdate);
  };

  const configButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenConfig(true),
    icon: "sliders",
    visible: privilege == PRIVILEGE.BOARD.EDITABLE,
  }

  const filterButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenFilters(true),
    icon: "filter",
    visible: privilege == PRIVILEGE.BOARD.EDITABLE,
  }

  const Contents = () => {
    if (!config.xAxis && !config.breakDownBy) {
      return (
        <div style={{ height: '100%' }}>
          <Placeholder
            bar
            message={
              <>
                {privilege === PRIVILEGE.BOARD.EDITABLE ? (
                  <>
                    Please add attributes to get started. Click <Icon icon="sliders" size="lg" /> to configure.
                  </>
                ) : (
                  <>
                    No attributes selected.
                  </>
                )}
              </>
            }
          />
        </div>
      )
    }
    return null;
  }

  return (
    <>
      <BoardFilters
        {...props}
        open={openFilters}
        setOpen={setOpenFilters}
      />
      <ChartConfigDrawer
        {...props}
        open={openConfig}
        setOpen={setOpenConfig}
        onConfigSave={onModalSave}
        title="Chart Configuration"
        config={deepCopy(config)}
      />
      <RemoteBarChart
        {...props}
        contents={Contents()}
        breakDownBy={config.breakDownBy || ""}
        chartType={config.chartType}
        xAxis={config.xAxis || ""}
        stacked={config.stacked || false}
        type={config.grouping || ""}
        forceUpdate={forceUpdate}
        utilityBarConfig={{
          title: {
            text: title,
            editable: privilege == PRIVILEGE.BOARD.EDITABLE,
            onSave: (value: string) => {
              saveTitle(value, id, boardObjectType, boardDataSource);
            }
          },
          buttons: [
            configButton,
            filterButton,
          ],
        }}
      />
    </>
  );
}
