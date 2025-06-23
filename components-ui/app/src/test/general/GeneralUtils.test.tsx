/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { expect, test, vitest } from "vitest";
import {
  isPropDefined,
  falseIfUndefined,
  isEmptyObject,
  normaliseCaps,
  timeout,
  numberWithSpaces,
  isInt,
  isFloat,
  generateId,
  getSourceData,
  getAttributeSources,
  getFlattenedMetaData,
  getAttributeDetail,
  FieldMeta,
} from "../../tol-ui/src";

test("isPropDefined function", () => {
  expect(isPropDefined(undefined)).toBe(false);
  expect(isPropDefined(true)).toBe(true);
});

test("falseIfUndefined function", () => {
  expect(falseIfUndefined(undefined)).toBe(false);
  expect(falseIfUndefined(true)).toBe(true);
});

test("isEmptyObject function", () => {
  const empty = {};
  const not_empty = { value: true };
  expect(isEmptyObject(empty)).toBe(true);
  expect(isEmptyObject(not_empty)).toBe(false);
});

test("normailseCaps function", () => {
  expect(normaliseCaps("id", "species")).toBe("Species ID");
  expect(normaliseCaps("test.relationship")).toBe("Test Relationship");
  expect(normaliseCaps("uid")).toBe("ID");
  expect(normaliseCaps("sts")).toBe("STS");
  expect(normaliseCaps("tolid")).toBe("ToLID");
});

test("timeout function", () => {
  vitest.useFakeTimers();
  vitest.spyOn(global, "setTimeout");
  timeout(1);
  expect(setTimeout).toHaveBeenCalledTimes(1);
});

test("numberWithSpaces Function", () => {
  expect(numberWithSpaces(5)).toBe("5");
  expect(numberWithSpaces(100)).toBe("100");
  expect(numberWithSpaces(1000)).toBe("1 000");
  expect(numberWithSpaces(10101)).toBe("10 101");
});

test("isInt Function", () => {
  expect(isInt(1)).toBe(true);
  expect(isInt(1000)).toBe(true);
  expect(isInt(1.5)).toBe(false);
  expect(isInt("number")).toBe(false);
});

test("isFloat Function", () => {
  expect(isFloat(1.5)).toBe(true);
  expect(isFloat(1.555555)).toBe(true);
  expect(isFloat(1)).toBe(false);
  expect(isFloat(1000)).toBe(false);
  expect(isFloat("number")).toBe(false);
});

test("generateId Function", () => {
  const prefix = "test";
  const id = generateId(prefix);
  const id2 = generateId(prefix);
  expect(id).toContain(prefix + "_");
  expect(id).toHaveLength(17);
  expect(id2).toContain(prefix + "_");
  expect(id2).toHaveLength(17);
  expect(id).not.toBe(id2);
});

test("getSourceData Function", () => {
  const fieldMeta: FieldMeta = {
    data: {
      attribute1: { source: "source1" },
      attribute2: { source: "source2" },
    },
    order: {
      active: ["attribute1", "attribute2"],
      inactive: [],
    },
  };
  expect(getSourceData(fieldMeta, "attribute1")).toBe("source1");
  expect(getSourceData(fieldMeta, "attribute2")).toBe("source2");
});

test("getAttributeSources function", () => {
  const entityMeta = {
    flatAttributes: {
      endpoint1: {
        attribute1: { source: "source1" },
        attribute2: { source: "source2" },
      },
      endpoint2: {
        attribute3: { source: "source3" },
        attribute4: { source: "source4" },
      },
    },
  };

  expect(getAttributeSources(entityMeta, "endpoint1")).toEqual([
    "all",
    "source1",
    "source2",
    "undefined",
  ]);
  expect(getAttributeSources(entityMeta, "endpoint2")).toEqual([
    "all",
    "source3",
    "source4",
    "undefined",
  ]);
  expect(getAttributeSources(entityMeta, "endpoint3")).toEqual([
    "all",
    "undefined",
  ]);
});

test("getFlattenedMetaData function", () => {
  const entityMeta = {
    flatAttributes: {
      endpoint1: {
        attr1: { data: "data1" },
        attr2: { data: "data2" },
      },
    },
  };
  expect(getFlattenedMetaData(entityMeta, "endpoint1")).toEqual({
    attr1: { data: "data1" },
    attr2: { data: "data2" },
  });
  expect(getFlattenedMetaData(entityMeta, "endpoint1", "attr1")).toEqual({
    data: "data1",
  });
  expect(
    getFlattenedMetaData(entityMeta, "endpoint1", "attr3"),
  ).toBeUndefined();
  expect(getFlattenedMetaData(entityMeta, "endpoint2")).toBeUndefined();
});

test("getAttributeDetail function", () => {
  const entityMeta = {
    flatAttributes: {
      endpoint1: {
        attr1: { display_name: "Display Name 1" },
        attr2: { display_name: "Display Name 2" },
      },
    },
  };
  expect(getAttributeDetail(entityMeta, "endpoint1", "attr1", 'display_name')).toBe(
    "Display Name 1",
  );
  expect(getAttributeDetail(entityMeta, "endpoint1", "attr2", 'display_name')).toBe(
    "Display Name 2",
  );
  expect(getAttributeDetail(entityMeta, "endpoint1", "attr3", 'display_name')).toBe("Attr3");
  expect(getAttributeDetail(entityMeta, "endpoint2", "attr1", 'display_name')).toBe("Attr1");
});
