/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Icon } from "../tol-ui/src";
import { Image } from "../tol-ui/src";


export function Sandbox() {
let images: string[] = ["https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png", "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"]

  return (
    <>
      <Image value={images} attribute="TOLQC" dataObject={null} renderer={{type:"image"}}/>
    </>
  );
}
