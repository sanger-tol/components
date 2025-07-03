/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/
import Leaflet from "leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import ReactDOMServer from "react-dom/server";
import { getCssVarValue } from "..";


export function generateIcon(marker: any) {
  let pointerColour = marker.colour;
  if (!marker.colour) {
    pointerColour = getCssVarValue("--tol-primary");
  }

  return Leaflet.divIcon({
    html: ReactDOMServer.renderToString(
      <FontAwesomeIcon
        icon={faLocationDot}
        style={{ color: pointerColour }}
        size="2x"
      />
    ),
    iconAnchor: [0, 20],
    className: "",
  });
}
