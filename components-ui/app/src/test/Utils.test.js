// SPDX-FileCopyrightText: 2023 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT
import {expect, test} from '@jest/globals';
import {isPropDefined} from '../tol-ui/src/general/Utils'

test('checks isPropDefined function', () => {
    expect(isPropDefined(undefined)).toBe(false);
});