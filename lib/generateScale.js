/**
 * Copyright (c) 2015-present, Vivace Studio.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule generateScale
 * @flow
 */
 'use strict'

 type Range = {
   min: number;
   max: number;
 };

 type Scale = {
   min: number;
   max: number;
   unit: number;
 };

// calculate the scale, need to extend scale below the min value
function generateScale(range : Range): Scale {
  // calculate unit base of range difference
  var diff = range.max - range.min;
  var diffLog = Math.ceil(Math.log10(diff));
  var diffMax = Math.pow(10, diffLog);
  var diffMin = Math.pow(10, diffLog - 1);
  var diffRounded = Math.round(diff / diffMax);
  // divide by 2 if diff is less than half of diffMax for better resolution
  var unit = diffMin / (diffRounded ? 1 : 2);
  // calculate min
  var min = Math.floor(range.min / unit) * unit - unit;
  // make sure no negative min if range is above 0
  if (range.min >= 0) {
    min = Math.max(0, min);
  }
  // calculate max
  var max = min;
  while (max < range.max) {
    max += unit;
  }
  return {min, max, unit};
};

module.exports = generateScale;