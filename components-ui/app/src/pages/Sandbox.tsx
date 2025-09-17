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

   const images: string[] = ["https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png", "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"]

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