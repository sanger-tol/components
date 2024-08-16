/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from 'react';
import Leaflet from 'leaflet';


interface LegendObject {
  key: string,
  colour: string
}

interface Props {
  map: Leaflet.Map,
  config: object[]
}

function MapLegend (props: Props){
  const { map, config } = props;
  useEffect(() => {
    const legend = (Leaflet.control as any)({ position: 'bottomright' });

    legend.onAdd = function () {
      const div = Leaflet.DomUtil.create('div', 'info legend');
      let htmlContent = '';

      config.map((legendObject: LegendObject) => {
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
};

export default MapLegend;