/**
 * Copyright (c) 2015-present, Vivace Studio.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule makeRange
 * @flow
 */
'use strict'

var resolveDatasets = require('./resolveDatasets');

type Dataset = {
   values: Array<number>;
 };

type Range = {
  min: number;
  max: number;
};

/**
 * Make range from datasets, optionally totalize the values of the same index
 * in different datasets for stacked bar chart
 */
function makeRange(datasets : Array<Dataset>, totalize: boolean): Range {
  var min = Number.MAX_VALUE;
  var max = Number.NEGATIVE_INFINITY;
  if (totalize) {
    var dataArray = resolveDatasets(datasets);
    dataArray.forEach(function(data, index) {
      // min
      data.forEach(function(datum, index) {
        min = Math.min(min, datum.value);
      });
      // max
      var total = 0;
      data.forEach(function(datum, index) {
        total += datum.value;
      });
      max = Math.max(max, total);
    });
  } else {
    datasets.forEach(function(dataset, index) {
      min = Math.min(min, ...dataset.values);
      max = Math.max(max, ...dataset.values);
    });
  }
  return { min, max };
};

module.exports = makeRange;
