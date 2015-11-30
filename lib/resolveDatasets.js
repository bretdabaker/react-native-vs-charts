/**
 * Copyright (c) 2015-present, Vivace Studio.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule resolveDatasets
 * @flow
 */
'use strict'

type Dataset = {
  values: Array<number>;
};

type Data = {
  value: number;
};

 /**
  * Resolve array of DatasetPropType into arrays of DataPropType:
  * [
  *  {..., values:[1, 3, 5, 7]},
  *  {..., values:[2, 4, 6, 8]}
  * ]
  * ->
  * [
  *  [{..., value:1}, {..., value:2}],
  *  [{..., value:3}, {..., value:4}]
  * ]
  */
function resolveDatasets(datasets: Array<Dataset>): Array<Array<Data>> {
  var dataArray = [];
  datasets.forEach(function(dataset, datasetIndex) {
    dataset.values.forEach(function(value, valueIndex){
      var data = dataArray[valueIndex];
      if (!data) {
        data = [];
        dataArray[valueIndex] = data;
      }
      data[datasetIndex] = {
        name: dataset.name,
        primaryColor: dataset.primaryColor,
        secondaryColor: dataset.secondaryColor,
        value: value
      }
    });
  });
  return dataArray;
};

module.exports = resolveDatasets;