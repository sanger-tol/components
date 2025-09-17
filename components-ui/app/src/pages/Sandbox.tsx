/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  RemoteTable,
  useZone,
  TOL_DS, Image
} from "../tol-ui/src";


export function Sandbox() {

  const species = useZone({
    objectType: "run_data",
    dataSource: TOL_DS,
    components: [{ id: "table-example" }],
  });

   const images: string[] = [
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
  const names: string[] = [
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

  //  Playing around to find the images in the TOLQC attribute in run_data
  // TOL_DS
  //       .getListPage({
  //         objectType: "run_data",
  //       }).then((response)=> {console.log(response)}) 

  return (
    <>
      <RemoteTable
        id="table-example"
        rowSelection
        pageSize={100}
        utilityBarConfig={{
          title: {
            text: "Run Data",
          },
        }}
        cellRenderers={{
          'image': Image
        }}
        fields={{
          data:{
            "id": {
              width:300,
              cellRenderer: {
                type:'image',
                props: {
                  value: images,
                  names: names,
                }
              }
            },
          },
          order: {
            active: ['id']
          }
        }}
        height={500}
        {...species}
      />
    </>);
}