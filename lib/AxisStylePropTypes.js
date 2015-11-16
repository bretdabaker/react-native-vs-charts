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

var ReactPropTypes = require('ReactPropTypes');
var React = require('react-native');
var {
  Text
} = React;

var StyleSheetValidation = require('StyleSheetValidation');

var AxisStylePropTypes = {
  axisLineWidth: ReactPropTypes.number,
  axisLineColor: ReactPropTypes.string,
  tickLength: ReactPropTypes.number,
  labelOffset: ReactPropTypes.number,
  gridlineWidth: ReactPropTypes.number,
  gridlineColor: ReactPropTypes.string,
  gridlineStyle: ReactPropTypes.oneOf(['solid', 'dotted', 'dashed']),
};

StyleSheetValidation.addValidStylePropTypes(AxisStylePropTypes);

module.exports = AxisStylePropTypes;
