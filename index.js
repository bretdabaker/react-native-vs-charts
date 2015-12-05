/**
 * Copyright (c) 2015-present, Vivace Studio.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */
'use strict';

var ViewStyleCharts = {
  // components
  Axes: require('./lib/Axes'),
  BarChart: require('./lib/BarChart'),
  LineChart: require('./lib/LineChart'),
  // prop types
  AxisStylePropTypes: require('./lib/AxisStylePropTypes'),
  DatasetPropType: require('./lib/DatasetPropType'),
  ScalePropType: require('./lib/ScalePropType'),
  // helper functions
  generateScale: require('./lib/generateScale'),
  makeRange: require('./lib/makeRange'),
  resolveDatasets: require('./lib/resolveDatasets')
};

module.exports = ViewStyleCharts;
