/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, CentreContents, Modal, DnD } from '../tol-ui/src';
import { useState } from 'react';
import ObjectDetail from '../tol-ui/src/general/ObjectDetail';

const jsonData = {
  "attributes": {
      "sts_checksum": "5a05480d238b6bb372d7458fc81e248333f70a7f9f318b09c083c9b83b416aa8",
      "sts_common_name": "",
      "sts_family": "Lamiaceae",
      "sts_genome_size": "1731060000",
      "sts_genus": "Galeopsis",
      "sts_hic_submitted_date": "Wed, 15 Mar 2023 20:00:16 GMT",
      "sts_order_group": "Lamiales",
      "sts_pacbio_submitted_date": "Thu, 09 Mar 2023 04:20:14 GMT",
      "sts_prefix": "daGalTetr",
      "sts_ready": true,
      "sts_rna_extracted_date": "Fri, 08 Sep 2023 10:55:29 GMT",
      "sts_scientific_name": "Galeopsis tetrahit",
      "sts_sequencing_material_status": null,
      "sts_sequencing_material_status_updated_at": null,
      "sts_species_id": 5443,
      "sts_taxon_group": "Tracheophyta",
      "sts_tissue_depleted": false,
      "sts_tol_updated_at": "Tue, 05 Dec 2023 01:55:03 GMT",
      "uid": "1000418"
  },
  "id": "1000418",
  "relationships": {
      "benchling_samples": {
          "links": {
              "related": "/data/species/1000418/benchling_samples"
          }
      },
      "sts_barcoding_run_datas": {
          "links": {
              "related": "/data/species/1000418/sts_barcoding_run_datas"
          }
      },
      "sts_samples": {
          "links": {
              "related": "/data/species/1000418/sts_samples"
          }
      }
  },
  "type": "species"
}


function Miscellaneous() {
  const [modalOpen, setModalOpen] = useState(false)
  const [contents, setContents] = useState()
  console.log(contents)

  return (
    <div>
      <CentreContents>
          <h2>Modal</h2>
          <Modal
            size='full'
            open={modalOpen}
            setOpen={setModalOpen}
          >
            <h2>Test Modal</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer est leo, blandit
              quis justo eu, tempus condimentum mauris. Suspendisse condimentum eu sapien 
              pellentesque pharetra. Sed in tincidunt dui, ac euismod nisi. Nullam lobortis 
              non metus ac bibendum. Maecenas a arcu consectetur, congue augue vitae, tempor 
              purus. Maecenas quis feugiat risus, ut ultricies felis. Sed non nulla nisi. Fusce 
              faucibus massa quis dignissim sodales. Cras sed sapien nec elit porttitor auctor. 
              Donec at ultricies velit.
            </p>
          </Modal>
          <Button onClick = {() => setModalOpen(true)}>Example Modal</Button>

          <h2 className='mt-5'>Object Detail</h2>
          <ObjectDetail data={jsonData.attributes}/>

          <h2 className='mt-5'>Drag & Drop</h2>
          <h5>DnD Contents: </h5>
          <DnD
            elements={{
              one: [
                {id: 'hello-div', element: <div className='tol-dnd-item'>Hello</div>},
                {id: 'bye-div', element: <div className='tol-dnd-item'>Bye</div>},
                {id: 'test-div', element: <div className='tol-dnd-item'>Test</div>}
              ],
              two: [
                {id: 'dog-div', element: <div className='tol-dnd-item'>Dog</div>},
                {id: 'cat-div', element: <div className='tol-dnd-item'>Cat</div>},
                {id: 'mouse-div', element: <div className='tol-dnd-item'>Mouse</div>}
              ]
            }}
            setContents={setContents}
          />
      </CentreContents>
    </div>
  );
}

export default Miscellaneous;
