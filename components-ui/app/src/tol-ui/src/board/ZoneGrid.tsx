/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  useZone,
  env,
  RemoteCount,
  RemoteBarChart,
  RemoteSunburst,
  RemoteTable,
  useEffectUpdate,
} from "../index";

interface Component {
  size: string;
  element: JSX.Element;
}

interface Widgets {
  components: Record<string, Component>;
  order: string[];
}

interface Props {
  id: string;
  widgets?: Widgets;
  objectType: string;
  onZoneReorder: any;
  deleteZone: any;
}

function ZoneGrid(props: Props) {
  const { objectType, widgets } = props;
  const [_, setCurrentWidgets] = useState<Widgets>(
    widgets || { components: {}, order: [] }
  );
  const z = useZone({
    endpoint: objectType,
    baseUrl: env.TOL_DATA,
    components: [],
  });

  const getComponent = (id: string, type: string, props: any) => {
    switch (type) {
      case "count":
        return <RemoteCount {...props} id={id} title={id} />;
      case "barchart":
        return (
          <RemoteBarChart
            {...props}
            id={id}
            title={id}
            stacked
            // temporary static
            type="M"
            breakDownBy="sts_family"
            xAxis="sts_dna_extracted_date"
          />
        );
      case "table":
        return <RemoteTable {...props} id={id} />;
      case "sunburst":
        return (
          <RemoteSunburst
            {...props}
            id={id}
            title={id}
            // temporary static
            sliceBy={["sts_order_group", "sts_family"]}
          />
        );
    }
  };

  const getWidgetsUsingZone = () => {
    const newWidgets = { components: {}, order: [] as string[] };
    for (const [id, component] of Object.entries(z.zone.components)) {
      newWidgets.components[id] = {
        size: component.data.size,
        element: getComponent(id, component.data.type!, z),
      };
    }
    newWidgets.order = z.zone.order;
    return newWidgets;
  };

  useEffectUpdate(() => {
    setCurrentWidgets(getWidgetsUsingZone());
  }, [z.zone]);


  return (
    <div className="tol-zone">
    </div>
  );
}

export default ZoneGrid;
