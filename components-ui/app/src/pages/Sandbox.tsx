/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/


// export function Sandbox() {
//  let images: string[] = ["https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png", "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"]
const images = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png"

//   return (
//     <>
//       <Image value={images} attribute="TOLQC" dataObject={null} renderer={{type:"image"}}/>
//     </>
//   );
// }

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

  const FilterCell = ({ success, warning, text }) => {
    return <div style={{ color: success ? 'green' : warning ? 'orange' : 'red' }}>{text}</div>;
  }

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