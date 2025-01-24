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
import { useEffect, useRef, useState } from 'react';


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
    pointerColour = getCssVarValue("--tol-primary")
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

function ScrollControl({ scrollWheel }) {
  const map = useMap();

  useEffect(() => {
    if (scrollWheel) {
      map.scrollWheelZoom.enable();  // Enable scroll zoom when state is true
    } else {
      map.scrollWheelZoom.disable(); // Disable scroll zoom when state is false
    }
  }, [scrollWheel, map]);

  return null;
}

function Map(props: Props) {
  const { id, markers, bubble, legend } = props;
  const height = (props.height !== undefined) ? props.height : "100%";

  const [scrollWheel, setScrollWheel] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setScrollWheel(true); 
    //Scrolls the page to the map
    mapRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    // Disables scroll wheel zoom when clicking outside the map
    const handleMouseDown = (event) => {
      if (event.target.closest('.tol-map')) {
        return;
      }
      setScrollWheel(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  };

  return (
    <div id={id} ref={mapRef} style={{height: height}} onClick={handleClick} className={scrollWheel ? 'map-selected': ''}>
      <MapContainer 
        center={[51.510357, -0.116773]}
        zoom={6}
        className="tol-map"
      >
        <ScrollControl scrollWheel={scrollWheel} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/*Renders text when not clicked on map */}
        {!scrollWheel && (
          <div className='map-zoom-text'>
            Please click on map to interact
          </div>
        )}
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
    