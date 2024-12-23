/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { env, useZone } from '../tol-ui/src';
import BoardFilters from '../tol-ui/src/filtering/BoardFilters';


function Sandbox() {
  const z = useZone({
    endpoint: 'species',
    baseUrl: env.TOL_DATA,
    filter: {
      and_: {
        'sts_order_group': {
          contains: {
            value: 'le'
          }
        }
      }
    },
    components: [
      {
        id: 'c_1j11mq9wkqDk',
        filter: {
          and_: {
            'benchling_checksum': {
              contains: {
                value: 'c'
              }
            }
          }
        }
      },
      {
        id: 'c_N281dwdg86xx',
        filter: {
          and_: {
            'sts_family': {
              in_list: {
                value: ['Hylocomiaceae', 'Crabronidae'],
                negate: true
              }
            }
          }
        }
      }
    ]
  });

  return (
    <>
      <BoardFilters
        entityType="zone"
        {...z}
      />
      <BoardFilters
        id="c_1j11mq9wkqDk"
        entityType="component"
        {...z}
      />
      <BoardFilters
        id="c_N281dwdg86xx"
        entityType="component"
        {...z}
      />
    </>
  );
}

export default Sandbox;
