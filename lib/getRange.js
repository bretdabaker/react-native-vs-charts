/**
 * Copyright (c) 2015-present, Vivace Studio.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getRange
 * @flow
 */
 'use strict'

type Dataset = {
   values: Array<number>;
 };

type Range = {
  min: number;
  max: number;
};

// get value range
function getRange(datasets : Array<Dataset>): Range {
  var min = Number.MAX_VALUE;
  var max = 0;
  datasets.forEach(function(dataset, index) {
    min = Math.min(min, ...dataset.values);
    max = Math.max(max, ...dataset.values);
  });
  return { min, max };
};

module.exports = getRange;
