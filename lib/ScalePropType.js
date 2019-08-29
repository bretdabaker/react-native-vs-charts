/**
 * Copyright (c) 2015-present, Vivace Studio.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ScalePropType
 */
'use strict';

/**
  * Common scale prop for charts with axes
  */
var React = require('react-native');

var ScalePropType = React.PropTypes.shape({
  min: React.PropTypes.number,
  max: React.PropTypes.number,
  unit: React.PropTypes.number
});

module.exports = ScalePropType;
