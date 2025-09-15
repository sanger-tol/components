/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Icon } from "../tol-ui/src";


export function Sandbox() {
let images: string[] = ["https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png", "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"]

const [currentIndex, setCurrentIndex] = useState(0);

const arrowPrev = () => {setCurrentIndex((prev) => prev === 0? images.length - 1: prev -1 )}

const arrowNext = () => {setCurrentIndex((prev) => prev === images.length - 1? 0 : prev + 1 )}

  return (
    <>
      <div className="d-flex align-items-center"
        style={{
          marginLeft: "500px",
          width: "200px",
          height: "100px",
          background: "purple",
        }}
      >
        <button className="btn btn-primary me-auto" onClick={arrowPrev}>
          <Icon icon="caret-left" />
        </button>
        <img src={images[currentIndex]} alt="Ditto" width="150px" height="100px"/> 
        <button className="btn btn-primary ms-auto" onClick={arrowNext}>
          <Icon icon="caret-right" />
        </button>
      </div>
    </>
  );
}
