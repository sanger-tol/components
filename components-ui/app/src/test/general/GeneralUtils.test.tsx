// SPDX-FileCopyrightText: 2023 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import {expect, test, vitest} from 'vitest';
import {
  isPropDefined,
  falseIfUndefined,
  isEmptyObject,
  normaliseCaps,
  timeout,
  numberWithSpaces,
  isInt,
  isFloat,
  generateId
} from '../../tol-ui/src/general/Utils'

test('isPropDefined function', () => {
  expect(isPropDefined(undefined)).toBe(false);
  expect(isPropDefined(true)).toBe(true)
});

test('falseIfUndefined function', () => {
  expect(falseIfUndefined(undefined)).toBe(false);
  expect(falseIfUndefined(true)).toBe(true);
})

test('isEmptyObject function', () => {
  const empty = {}
  const not_empty = {'value': true}
  expect(isEmptyObject(empty)).toBe(true);
  expect(isEmptyObject(not_empty)).toBe(false);
})

test('normailseCaps function', () => {
  expect(normaliseCaps()).toBe("");
  expect(normaliseCaps('id', 'species')).toBe("Species ID");
  expect(normaliseCaps('test.relationship')).toBe('Test Relationship')
  expect(normaliseCaps('uid')).toBe('ID')
  expect(normaliseCaps('sts')).toBe('STS')
  expect(normaliseCaps('tolid')).toBe('ToLID')
})

test('timeout function', () => {
  vitest.useFakeTimers()
  vitest.spyOn(global, 'setTimeout')
  timeout(1)
  expect(setTimeout).toHaveBeenCalledTimes(1)
})

test('numberWithSpaces Function',() => {
  expect(numberWithSpaces(5)).toBe('5')
  expect(numberWithSpaces(100)).toBe('100')
  expect(numberWithSpaces(1000)).toBe('1 000')
  expect(numberWithSpaces(10101)).toBe('10 101')
})

test('isInt Function',() => {
  expect(isInt(1)).toBe(true)
  expect(isInt(1000)).toBe(true)
  expect(isInt(1.5)).toBe(false)
  expect(isInt('number')).toBe(false)
})

test('isFloat Function',() => {
  expect(isFloat(1.5)).toBe(true)
  expect(isFloat(1.555555)).toBe(true)
  expect(isFloat(1)).toBe(false)
  expect(isFloat(1000)).toBe(false)
  expect(isFloat('number')).toBe(false)
})

test('generateId Function',() => {
  const prefix = 'test'
  const id = generateId(prefix)
  const id2 = generateId(prefix)
  expect(id).toContain(prefix + '_')
  expect(id).toHaveLength(17)
  expect(id2).toContain(prefix + '_')
  expect(id2).toHaveLength(17)
  expect(id).not.toBe(id2)
})
