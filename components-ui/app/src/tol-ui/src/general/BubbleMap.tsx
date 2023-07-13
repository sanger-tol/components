/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { MapContainer, TileLayer } from 'react-leaflet';
import Marker from "react-leaflet-enhanced-marker";
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from "react-leaflet-cluster";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';


interface Props {
    points: number[][],
    height: number
}

function BubbleMap(props: Props) {
  const { points, height } = props;

  return (
    <div style={{height: height.toString() + 'px'}}>
      <MapContainer center={[51.510357, -0.116773]} zoom={6} scrollWheelZoom className="tol-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup chunkedLoading>
          {points.map((point, index) => {
            return(
              <Marker
                key={index}
                position={point}
                icon={<FontAwesomeIcon icon={faLocationDot} size="3x" className='tol-map-pointer-icon'/>}
              />
            )
          })}
        </MarkerClusterGroup>

      </MapContainer>
    </div>
  );
}

export default BubbleMap;
    