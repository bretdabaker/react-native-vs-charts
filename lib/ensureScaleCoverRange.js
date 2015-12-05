/**
 * Copyright (c) 2015-present, Vivace Studio.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ensureScaleCoverRange
 * @flow
 */
'use strict'

var invariant = require('invariant');

type Dataset = {
  values: Array<number>;
 };

type Scale = {
  min: number;
  max: number;
  unit: number;
};

var resolveDatasets = require('./resolveDatasets');
var makeRange = require('./makeRange');

function ensureScaleCoverRange(scale: Scale, datasets: Array<Dataset>, totalize: boolean) {
  invariant(
    (scale != null),
    'scale is required'
  );
  var range = makeRange(datasets, totalize);
  invariant(
    (scale.min <= range.min),
    'scale.min: ' +
    scale.min +
    ', must be lesser or equal to the minimum value of the range: ' +
    range.min
  );
  invariant(
    (scale.max >= range.max),
    'scale.max: ' +
    scale.max +
    ', must be greater or equal to the maximum value of the range: ' +
    range.max +
    ', range is totalized: ' +
    totalize
  );
  invariant(
    (scale.unit < (scale.max - scale.min) && scale.unit > 0),
    'scale.unit: ' +
    scale.unit +
    ', must be within scale range and greater than zero: ' +
    JSON.stringify(scale) +
    ', range is totalized: ' +
    totalize
  );
};

module.exports = ensureScaleCoverRange;