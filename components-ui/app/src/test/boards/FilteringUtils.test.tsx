/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { expect, test } from "vitest";
import {
  cleanFilterAttributesFromBoardEntity,
  deleteFilterAttributeFromBoardEntity,
  type IComponent,
  type IZone,
} from "../../tol-ui/src";


test("deleteFilterAttributeFromBoardEntity removes an attribute from a component filter", () => {
  const component: IComponent = {
    id: "component-1",
    filter: {
      and_: {
        status: { eq: { value: "active", negate: false } },
        category: { eq: { value: "sample", negate: false } },
      },
    },
    defaultFilter: {
      and_: {
        status: { eq: { value: "active", negate: false } },
        category: { eq: { value: "sample", negate: false } },
      },
    },
  };

  deleteFilterAttributeFromBoardEntity({
    attribute: "status",
    boardEntity: component,
  });

  expect(component.filter?.and_?.status).toBeUndefined();
  expect(component.defaultFilter?.and_?.status).toBeUndefined();
  expect(component.filter?.and_?.category).toEqual({
    eq: { value: "sample", negate: false },
  });
});

test("deleteFilterAttributeFromBoardEntity removes an attribute from a zone filter", () => {
  const zone: IZone = {
    id: "zone-1",
    order: [],
    children: {},
    filter: {
      and_: {
        status: { eq: { value: "active", negate: false } },
        category: { eq: { value: "sample", negate: false } },
      },
    },
    defaultFilter: {
      and_: {
        status: { eq: { value: "active", negate: false } },
        category: { eq: { value: "sample", negate: false } },
      },
    },
  };

  deleteFilterAttributeFromBoardEntity({
    attribute: "status",
    boardEntity: zone,
  });

  expect(zone.filter?.and_?.status).toBeUndefined();
  expect(zone.defaultFilter?.and_?.status).toBeUndefined();
  expect(zone.filter?.and_?.category).toEqual({
    eq: { value: "sample", negate: false },
  });
});

test("deleteFilterAttributeFromBoardEntity is a no-op when the attribute is missing", () => {
  const component: IComponent = {
    id: "component-1",
    filter: {
      and_: {
        category: { eq: { value: "sample", negate: false } },
      },
    },
    defaultFilter: {
      and_: {
        category: { eq: { value: "sample", negate: false } },
      },
    },
  };

  deleteFilterAttributeFromBoardEntity({
    attribute: "status",
    boardEntity: component,
  });

  expect(component.filter?.and_).toEqual({
    category: { eq: { value: "sample", negate: false } },
  });
  expect(component.defaultFilter?.and_).toEqual({
    category: { eq: { value: "sample", negate: false } },
  });
});

test("cleanFilterAttributesFromBoardEntity removes all attributes from a component filter", () => {
  const component: IComponent = {
    id: "component-1",
    filter: {
      and_: {
        status: { eq: { value: "active", negate: false } },
        category: { eq: { value: "sample", negate: false } },
      },
    },
    defaultFilter: {
      and_: {
        status: { eq: { value: "active", negate: false } },
        category: { eq: { value: "sample", negate: false } },
      },
    },
  };

  cleanFilterAttributesFromBoardEntity({
    boardEntity: component,
  });

  expect(component.filter).toEqual({});
  expect(component.defaultFilter).toEqual({});
});

test("cleanFilterAttributesFromBoardEntity is a no-op when there are no attributes", () => {
  const zone: IZone = {
    id: "zone-1",
    order: [],
    children: {},
    filter: {},
    defaultFilter: {},
  };

  cleanFilterAttributesFromBoardEntity({
    boardEntity: zone,
  });

  expect(zone.filter).toEqual({});
  expect(zone.defaultFilter).toEqual({});
});
