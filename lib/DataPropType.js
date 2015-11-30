/**
 * Copyright (c) 2015-present, Vivace Studio.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DataPropType
 */
'use strict';

var ReactPropTypes = require('ReactPropTypes');

/**
  * Common data set prop used by different charts
  */
var DataPropType = ReactPropTypes.shape({
  // Used for legend
  name: ReactPropTypes.string,

  // Different charts interpret primary and secondary color differently,
  // e.g. a bar chart might take primary color as fill color and secondary
  // color as border color;
  primaryColor: ReactPropTypes.string,
  secondaryColor: ReactPropTypes.string,
  value: ReactPropTypes.number.isRequired
});

module.exports = DataPropType;
