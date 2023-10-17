/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from "react-leaflet-cluster";
import Leaflet from 'leaflet';
import { FormatTooltip } from '../general';
//@ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';


interface Props {
  markers: any[],
  height: number
}

let DefaultIcon = Leaflet.icon({
  iconUrl: icon,
  iconSize: [20,35],
  iconAnchor: [12,41],
  popupAnchor: [-2, -36]
});

Leaflet.Marker.prototype.options.icon = DefaultIcon;

function BubbleMap(props: Props) {
  const { markers, height } = props;

  return (
    <div style={{height: height.toString() + 'px'}}>
      <MapContainer center={[51.510357, -0.116773]} zoom={6} scrollWheelZoom className="tol-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

       <MarkerClusterGroup chunkedLoading>
          {markers.map((marker, index) => {
            return(
              <Marker
                key={index}
                position={marker.geometry.coordinates}
              >
                {Object.keys(marker.properties).length > 0 && (
                  <Popup className='tol-map-popup'>
                    <FormatTooltip contents={ marker.properties } />
                  </Popup>
                )}
              </Marker>
            )
          })}
        </MarkerClusterGroup>

      </MapContainer>
    </div>
  );
}

export default BubbleMap;
    