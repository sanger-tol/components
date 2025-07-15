/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { TsDataSource, DetailAttribute, Widgets, env } from "../tol-ui/src";

export function DataSource() {
  const ds1 = new TsDataSource({ baseUrl: env.TOL_DATA });

  ds1
    .getOne({
      objectType: "species",
      id: "9606",
    })
    .then((dataObject) => {
      console.log("Get One: ", dataObject);
    });

  ds1
    .getListPage({
      objectType: "species",
    })
    .then((dataObjects) => {
      console.log("List Page: ", dataObjects);
    });

  const f1 = ds1.getListByCursor({
    objectType: "species",
  });

  for (let i = 0; i < 20; i++) {
    f1.next().then((dataObjects) => {
      console.log("List Page Cursor - First 20: ", dataObjects.value);
    });
  }

  ds1
    .getList({
      objectType: "species",
      filter: {
        and_: {
          sts_sample_sts_programme_union: {
            eq: {
              value: "ToL",
            }
          },
          sts_scientific_name: {
            contains: {
              value: "L"
            }
          }
        }
      }
    })
    .then((res) => console.log("List Page Cursor - All ToL Species that have a name that starts with 'L': ", res))
    .catch((error) => console.log(error));

  ds1
    .getByIds({
      objectType: "species",
      ids: ["9606", "abc", "9606"],
    })
    .then((dataObjects) => {
      console.log(dataObjects);
    });

  ds1
    .attributeMetadata()
    .then((data) => {
      console.log("Attribute Metadata:", data);
    })
    .catch((error) => {
      console.error("Error fetching attribute metadata (portal):", error);
    });

  ds1
    .relationshipConfig()
    .then((data) => {
      console.log("Relationship Config:", data);
    })
    .catch((error) => {
      console.error("Error fetching relationship config (portal):", error);
    });

  ds1
    .getEntityMeta()
    .then((data) => {
      console.log("Entity Meta (w/ flattened attributes) (portal):", data);
    })
    .catch((error) => {
      console.error("Error fetching entityMeta:", error);
    });

  const ds2 = new TsDataSource();

  ds2
    .attributeMetadata()
    .then((data) => {
      console.log("Attribute Metadata:", data);
    })
    .catch((error) => {
      console.error("Error fetching attribute metadata:", error);
    });

  ds2
    .relationshipConfig()
    .then((data) => {
      console.log("Relationship Config:", data);
    })
    .catch((error) => {
      console.error("Error fetching relationship config (portal):", error);
    });

  ds2
    .getEntityMeta()
    .then((data) => {
      console.log("Entity Meta (w/ flattened attributes) (portal):", data);
    })
    .catch((error) => {
      console.error("Error fetching entityMeta:", error);
    });

  /*
  ds2.deleteByID({
    objectType: 'species',
    id: '1'
  }).catch(error => {
    console.error('Error fetching entityMeta:', error);
  });
  */

  //ds2.upsert({
  //  objectType: 'species',
  //  attributes: {
  //    name: "test",
  //    scientific_name: "test",
  //    genus: "test",
  //    family: "test",
  //  }
  //})

  const dataSource = <h5>See console for TSDataSource examples...</h5>;

  const detailAttribute = (
    <div>
      <h5>DetailAttribute</h5>
      Fetching a detail endpoint attribute with loading. These are usually used
      in table cells.
      <DetailAttribute
        id="9606"
        objectType="species"
        dataSource={ds1}
        attribute="id"
      />
      <DetailAttribute
        id="9606"
        objectType="species"
        dataSource={ds1}
        attribute="tolid_prefix"
      />
      <DetailAttribute
        id="9606"
        objectType="species"
        dataSource={ds1}
        attribute="sts_order_group"
      />
    </div>
  );

  const components = [
    {
      component: dataSource,
      type: "full",
    },
    {
      component: detailAttribute,
      type: "full",
    },
  ];

  return (
    <div className="datasource">
      <Widgets components={components} />
    </div>
  );
}
