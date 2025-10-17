/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { PCell, Icon, ImageModal } from "../..";
import { useState } from "react";

export interface PImage extends PCell {
  value: string | string[];
  captions: string | string[];
}

export function Image(props: PImage) {
  // const { value, captions } = props;
  const value: string[] = [
    "https://img.pokemondb.net/sprites/ruby-sapphire/shiny/bulbasaur.png",
    "https://img.pokemondb.net/sprites/ruby-sapphire/shiny/ivysaur.png",
    "https://img.pokemondb.net/sprites/ruby-sapphire/shiny/venusaur.png",
    "https://img.pokemondb.net/sprites/ruby-sapphire/shiny/squirtle.png",
    "https://img.pokemondb.net/sprites/ruby-sapphire/shiny/feraligatr.png",
    "https://img.pokemondb.net/sprites/ruby-sapphire/shiny/blastoise.png",
    "https://img.pokemondb.net/sprites/ruby-sapphire/shiny/charmander.png",
    "https://img.pokemondb.net/sprites/ruby-sapphire/shiny/charmeleon.png",
    "https://img.pokemondb.net/sprites/ruby-sapphire/shiny/charizard.png",
  ];
  const captions: string[] = [
    "bulbasaur",
    "ivysaur",
    "venusaur",
    "squirtle",
    "wartortle",
    "blastoise",
    "charmander",
    "charmeleon",
    "charizard",
  ]

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  const multipleImages = Array.isArray(value);

  const arrowPrev = (
    setIndex: React.Dispatch<React.SetStateAction<number>>
  ) => {
    setIndex((prev) => (prev === 0 ? value.length - 1 : prev - 1));
  };

  const arrowNext = (
    setIndex: React.Dispatch<React.SetStateAction<number>>
  ) => {
    setIndex((prev) => (prev === value.length - 1 ? 0 : prev + 1));
  };

  return (
    <div>
      <ImageModal
        value={value}
        captions={captions}
        open={open}
        setOpen={setOpen}
        currentIndex={currentIndex}
      />
      <span className={"tol-table-image-cell"}>
        {multipleImages && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Icon
              icon="caret-left"
              onClick={() => arrowPrev(setCurrentIndex)}
              size="1x"
              className={"tol-table-image-cell-arrow"}
            />
          </div>
        )}
        <img
          src={multipleImages ? value[currentIndex] : value}
          style={{ maxHeight: "60px", }}
          onClick={() => {
            value.length > 0 && setOpen((prev: boolean) => !prev);
          }}
        />
        {multipleImages && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Icon
              icon="caret-right"
              onClick={() => arrowNext(setCurrentIndex)}
              size="1x"
              className={"tol-table-image-cell-arrow"}
            />
          </div>
        )}
      </span>
    </div>
  );
}
