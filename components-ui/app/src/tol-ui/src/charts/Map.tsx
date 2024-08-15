/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { MapContainer, TileLayer, Popup, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from "react-leaflet-cluster";
import Leaflet from 'leaflet';
import { FormatTooltip } from '../general';
import { getCssVarValue } from '../general/Utils';
import MapLegend  from './MapLegend';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
//@ts-ignore
import ReactDOMServer from 'react-dom/server';


interface Props {
  id: string,
  markers: any[],
  height?: any,
  bubble?: boolean,
  legend?: object[]
}

interface MapWithLegendProps {
  config: object[]
}

const generateIcon = (marker) => {
  
  let pointerColour = marker.colour
  if (!marker.colour) {
    pointerColour = getCssVarValue("--primary")
  }

  return Leaflet.divIcon({
    html: ReactDOMServer.renderToString(<FontAwesomeIcon icon={faLocationDot} style={{ color: pointerColour }} size='2x' />),
    iconAnchor: [0,20],
    className: ''
  });
}

function MapWithLegend(props: MapWithLegendProps) {
  const { config } = props;
  const map = useMap();
  return <MapLegend map={map} config={config} />;
};

function Map(props: Props) {
  const { id, markers, bubble, legend } = props;
  const height = (props.height !== undefined) ? props.height : "100%";

  return (
    <div id={id} style={{height: height}}>
      <MapContainer center={[51.510357, -0.116773]} zoom={6} scrollWheelZoom className="tol-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {bubble ?
          <MarkerClusterGroup chunkedLoading>
            {markers.map((marker, index) => {
              const customIcon = generateIcon(marker);
              return (
                <Marker
                  key={index}
                  position={marker.geometry.coordinates}
                  icon={customIcon}
                >
                  {Object.keys(marker.properties).length > 0 && (
                    <Popup className='tol-map-popup'>
                      <FormatTooltip contents={ marker.properties } />
                    </Popup>
                  )}
                </Marker>
              );
            })}
          </MarkerClusterGroup>
          :
          <div>
            {markers.map((marker, index) => {
              const customIcon = generateIcon(marker);
              return (
                <Marker
                  key={index}
                  position={marker.geometry.coordinates}
                  icon={customIcon}
                >
                  {Object.keys(marker.properties).length > 0 && (
                    <Popup className='tol-map-popup'>
                      <FormatTooltip contents={ marker.properties } />
                    </Popup>
                  )}
                </Marker>
              );
            })}
          </div>
        }
        {legend && legend.length > 0 && <MapWithLegend config={legend}/>}
      </MapContainer>
    </div>
  );
}

export default Map;
    