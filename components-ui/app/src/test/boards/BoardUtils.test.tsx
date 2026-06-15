/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { describe, expect, test } from "vitest";

import { BOARD_ENTITIES, defineBoardEntity, defineBoardEntityInParent, deriveBoardChildObjectType, deriveBoardObjectType, getEntityPrefix, IComponent, IZone, TBoardEntity, TsDataSource } from "../../tol-ui/src";

describe("getEntityPrefix function", () => {
  test("The correct prefix is returned for each type of entity", () => {
    expect(getEntityPrefix("board")).toBe("b");
    expect(getEntityPrefix("view")).toBe("v");
    expect(getEntityPrefix("zone")).toBe("z");
    expect(getEntityPrefix("component")).toBe("c");
  });
});

describe("deriveBoardObjectType function", () => {
  test("The correct prefix is returned for an id of each board entity kind", () => {
    const { BOARD, VIEW, ZONE, COMPONENT } = BOARD_ENTITIES.ENTITIES;

    expect(deriveBoardObjectType("b_suyrg8ojo")).toBe(BOARD);
    expect(deriveBoardObjectType("v_lsdifu9uj")).toBe(VIEW);
    expect(deriveBoardObjectType("z_3ewrfdghE")).toBe(ZONE);
    expect(deriveBoardObjectType("c_897YGHJuy")).toBe(COMPONENT);
  });

  test("An error is thrown for an id that is of an unrecognised entity", () => {
    expect(() => deriveBoardObjectType("u_lksSb873s")).toThrow("Unknown board entity prefix: u");
  });

  test("An error is thrown for an invalid id", () => {
    expect(() => deriveBoardObjectType("  hu8og  8")).toThrow("Unknown board entity prefix:  ");
  });
});

describe("deriveBoardChildObjectType function", () => {
  test("Each valid child entity type is determined correctly", () => {
    const { BOARD, VIEW, ZONE, COMPONENT } = BOARD_ENTITIES.ENTITIES;

    expect(deriveBoardChildObjectType(BOARD)).toBe(VIEW);
    expect(deriveBoardChildObjectType(VIEW)).toBe(ZONE);
    expect(deriveBoardChildObjectType(ZONE)).toBe(COMPONENT);
  });

  test("The last entity in the hierarchy has no child", () => {
    expect(() => deriveBoardChildObjectType(BOARD_ENTITIES.ENTITIES.COMPONENT)).toThrow(
      `Unknown parent object type: ${BOARD_ENTITIES.ENTITIES.COMPONENT}`
    );
  });

  test("An error is thrown on a non-existant board entity kind", () => {
    expect(() => deriveBoardChildObjectType("cool object 😎")).toThrow(
      "Unknown parent object type: cool object 😎"
    );
  });
});

describe(
  "Board entity definitions (defineBoardEntity, defineChildrenEntities, defineBoardEntityInParent functions)",
  () => {
    // The data space is a TsDataSource which we can't really compare
    const assertEntitiesEqual = (actual: Partial<TBoardEntity>, expected: Partial<TBoardEntity>) => {
      const removeDataspace = (obj: any) => {
        let newObj = obj;

        // Remove the dataspace from this object
        if (Object.hasOwn(obj, "dataspace")) {
          delete newObj["dataspace"];
        }
        
        // If there are any child entities, remove it from them too
        if (Object.hasOwn(obj, "children")) {
          newObj = {
            ...newObj,
            children: Object.values(obj["children"]).map(child => removeDataspace(child))
          };
        }
        
        return newObj;
      }
      
      expect(removeDataspace(actual)).toEqual(removeDataspace(expected));
    };

    test("Definition at the lowest level works (no recursion)", () => {
      const component: Partial<IComponent> = {
        id: "c_jlhdYFA89",
        data_source_instance_id: "test",
        ui_api_details: {
          url: "https://portal.tol.sanger.ac.uk",
          apiPath: "/api/v1",
          dataspace: "test",
          apiDataPath: "/data"
        },
      };

      const expected: Partial<IComponent> = {
        id: "c_jlhdYFA89",
        data_source_instance_id: "test",
        ui_api_details: {
          url: "https://portal.tol.sanger.ac.uk",
          apiPath: "/api/v1",
          dataspace: "test",
          apiDataPath: "/data"
        },
        filter: { and_: {} },
        defaultFilter: { and_: {} },
        title: ""
      };

      assertEntitiesEqual(defineBoardEntity(component, BOARD_ENTITIES.ENTITIES.COMPONENT), expected);
    });

    test("Defining one component with no children", () => {
      const zone: Partial<IZone> = {
        id: "z_aklds8DcGv",
        data_source_instance_id: "test",
        ui_api_details: {
          url: "https://portal.tol.sanger.ac.uk",
          apiPath: "/api/v1",
          dataspace: "test",
          apiDataPath: "/data"
        },
      };

      const expected: Partial<IZone> = {
        id: "z_aklds8DcGv",
        data_source_instance_id: "test",
        ui_api_details: {
          url: "https://portal.tol.sanger.ac.uk",
          apiPath: "/api/v1",
          dataspace: "test",
          apiDataPath: "/data"
        },
        filter: { and_: {} },
        defaultFilter: { and_: {} },
        title: "",

        // Difference from previous test (from additional if clause)
        order: [],
        children: {}
      };

      assertEntitiesEqual(defineBoardEntity(zone, BOARD_ENTITIES.ENTITIES.ZONE), expected);
    });

    test("Defining a component with children (recursive)", () => {
      const zone: Partial<IZone> = {
        id: "z_aklds8DcGv",
        data_source_instance_id: "test",
        ui_api_details: {
          url: "https://portal.tol.sanger.ac.uk",
          apiPath: "/api/v1",
          dataspace: "test",
          apiDataPath: "/data"
        },
        children: {
          "c_jlhdYFA89": {
            id: "c_jlhdYFA89",
            data_source_instance_id: "test",
            ui_api_details: {
              url: "https://portal.tol.sanger.ac.uk",
              apiPath: "/api/v1",
              dataspace: "test",
              apiDataPath: "/data"
            },
          },
          "c_687YLHdga": {
            id: "c_687YLHdga",
            data_source_instance_id: "test",
            ui_api_details: {
              url: "https://portal.tol.sanger.ac.uk",
              apiPath: "/api/v1",
              dataspace: "test",
              apiDataPath: "/data"
            },
          }
        }
      };

      const expected: Partial<IZone> = {
        id: "z_aklds8DcGv",
        data_source_instance_id: "test",
        ui_api_details: {
          url: "https://portal.tol.sanger.ac.uk",
          apiPath: "/api/v1",
          dataspace: "test",
          apiDataPath: "/data"
        },
        filter: { and_: {} },
        defaultFilter: { and_: {} },
        title: "",
        order: [],
        children: {
          "c_jlhdYFA89": {
            id: "c_jlhdYFA89",
            data_source_instance_id: "test",
            ui_api_details: {
              url: "https://portal.tol.sanger.ac.uk",
              apiPath: "/api/v1",
              dataspace: "test",
              apiDataPath: "/data"
            },
            filter: { and_: {} },
            defaultFilter: { and_: {} },
            title: "",
          },
          "c_687YLHdga": {
            id: "c_687YLHdga",
            data_source_instance_id: "test",
            ui_api_details: {
              url: "https://portal.tol.sanger.ac.uk",
              apiPath: "/api/v1",
              dataspace: "test",
              apiDataPath: "/data"
            },
            filter: { and_: {} },
            defaultFilter: { and_: {} },
            title: "",
          }
        }
      };

      assertEntitiesEqual(defineBoardEntity(zone, BOARD_ENTITIES.ENTITIES.ZONE), expected);
    });

    test("Defining new entity and adding it to the parent", () => {
      const zone: IZone = {
        id: "z_aklds8DcGv",
        data_source_instance_id: "test",
        ui_api_details: {
          url: "https://portal.tol.sanger.ac.uk",
          apiPath: "/api/v1",
          dataspace: "test",
          apiDataPath: "/data"
        },
        order: [],
        children: {}
      };
      const component: Partial<IComponent> = {
        id: "c_jlhdYFA89",
        data_source_instance_id: "test",
        ui_api_details: {
          url: "https://portal.tol.sanger.ac.uk",
          apiPath: "/api/v1",
          dataspace: "test",
          apiDataPath: "/data"
        },
      };

      const expected: Partial<IZone> = {
        id: "z_aklds8DcGv",
        data_source_instance_id: "test",
        ui_api_details: {
          url: "https://portal.tol.sanger.ac.uk",
          apiPath: "/api/v1",
          dataspace: "test",
          apiDataPath: "/data"
        },
        filter: { and_: {} },
        defaultFilter: { and_: {} },
        title: "",
        order: [],
        children: {
          "c_jlhdYFA89": {
            id: "c_jlhdYFA89",
            data_source_instance_id: "test",
            ui_api_details: {
              url: "https://portal.tol.sanger.ac.uk",
              apiPath: "/api/v1",
              dataspace: "test",
              apiDataPath: "/data"
            },
            filter: { and_: {} },
            defaultFilter: { and_: {} },
            title: ""
          }
        }
      };

      assertEntitiesEqual(
        defineBoardEntityInParent(BOARD_ENTITIES.ENTITIES.COMPONENT, component, zone),
        expected
      );
    });
  }
);
