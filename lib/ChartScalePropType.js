/**
 * Copyright (c) 2015-present, Vivace Studio.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ChartDatasetPropType
 * @flow
 */
'use strict';

/**
  * Common scale prop for charts with axes
  */
var ReactPropTypes = require('ReactPropTypes');

var ChartScalePropType = ReactPropTypes.shape({
  min: ReactPropTypes.number,
  max: ReactPropTypes.number,
  unit: ReactPropTypes.number
});

module.exports = ChartScalePropType;
