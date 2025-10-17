/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { ImageModal } from "../..";

export interface PImages {
  value: any;
  captions: any;
}

export function Images(props: PImages) {
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

  const [open, setOpen] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // could be single or multiple images
  const urlList = Array.isArray(value) ? value : [value];
  return (
    <div className="tol-table-expanded-row">
      <ImageModal
        value={value}
        captions={captions}
        open={open}
        setOpen={setOpen}
        currentIndex={currentIndex}
      />
      {urlList.map((url, index) => (
        <img
          // className={currentIndex != index ? "tol-table-expanded-row-img": "tol-table-expanded-row-img-active"}
          className="tol-table-expanded-row-img"
          key={url}
          src={url}
          alt={captions[index] || url}
          onClick={() => {
            setCurrentIndex(index);
            setOpen(true)
          }}
        />
      ))}
    </div>
  );
}
