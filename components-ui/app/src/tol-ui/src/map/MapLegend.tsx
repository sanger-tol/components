/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from "react";
import Leaflet from "leaflet";
import { ILegendObject } from "..";

export interface PMapLegend {
  map: Leaflet.Map;
  config: object[];
}

export function MapLegend(props: PMapLegend) {
  const { map, config } = props;

  useEffect(() => {
    const legend = (Leaflet.control as any)({ position: "bottomright" });

    legend.onAdd = function () {
      const div = Leaflet.DomUtil.create("div", "info legend");
      let htmlContent = "";

      config.map((legendObject: ILegendObject) => {
        htmlContent += `<i style="background: ${legendObject.colour}"></i> ${legendObject.key}<br>`;
      });

      div.innerHTML = htmlContent;
      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
}
