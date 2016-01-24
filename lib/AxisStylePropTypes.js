/**
 * Copyright (c) 2015-present, Vivace Studio.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule AxisStylePropTypes
 */
'use strict';

var React = require('react-native');

var StyleSheetValidation = require('react-native/Libraries/StyleSheet/StyleSheetValidation');

var AxisStylePropTypes = {
  axisLineWidth: React.PropTypes.number,
  axisLineColor: React.PropTypes.string,
  tickLength: React.PropTypes.number,
  labelOffset: React.PropTypes.number,
  gridlineWidth: React.PropTypes.number,
  gridlineColor: React.PropTypes.string,
  gridlineStyle: React.PropTypes.oneOf(['solid', 'dotted', 'dashed']),
};

StyleSheetValidation.addValidStylePropTypes(AxisStylePropTypes);

module.exports = AxisStylePropTypes;
