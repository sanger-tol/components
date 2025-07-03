/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export interface PScrollControl {
  scrollWheel: any;
}

export function ScrollControl(props: PScrollControl) {
  const { scrollWheel } = props;

  const map = useMap();

  useEffect(() => {
    if (scrollWheel) {
      map.scrollWheelZoom.enable(); // Enable scroll zoom when state is true
    } else {
      map.scrollWheelZoom.disable(); // Disable scroll zoom when state is false
    }
  }, [scrollWheel, map]);

  return null;
}
