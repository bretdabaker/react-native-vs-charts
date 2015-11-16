/**
 * Copyright (c) 2015-present, Vivace Studio.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule BarChart
 * @flow
 */
'use strict';

var invariant = require('invariant');

var ReactPropTypes = require('ReactPropTypes');
var ViewStylePropTypes = require('ViewStylePropTypes');
var React = require('react-native');
var {
  StyleSheet,
  Text,
  View,
} = React;

var ChartDatasetPropType = require('./ChartDatasetPropType');
var ChartScalePropType = require('./ChartScalePropType');

/**
  * Bar
  */
var Bar = React.createClass({
  propTypes: {
    orientation: ReactPropTypes.oneOf(['vertical', 'horizontal']),
    borderColor: ReactPropTypes.string,
    fillColor: ReactPropTypes.string,
    borderStyle: ViewStylePropTypes.borderStyle,
    borderWidth: ReactPropTypes.number,
    value: ReactPropTypes.number,
    minValue: ReactPropTypes.number,
    maxValue: ReactPropTypes.number,
    marginStart: ReactPropTypes.number,
    marginEnd: ReactPropTypes.number,
    // not used, stored for reference only
    name: ReactPropTypes.string
  },

  getDefaultProps(): Props {
    return {
      orientation: 'vertical',
      borderStyle: 'solid',
      borderWidth: 1,
      fillColor: '#CBDDE6',
      borderColor: '#A2C3D2',
    }
  },

  render: function() {
    var vertical = this.props.orientation == 'vertical';
    var directionStyle = {
      flexDirection: vertical ? 'column' : 'row'
    };
    // use flex to draw the bar
    var maxFlex = this.props.maxValue - this.props.minValue;
    var valueFlex = this.props.value - this.props.minValue;
    var antiValueFlex = maxFlex - valueFlex;
    // outter bar style
    var marginStyle = {
      marginLeft: vertical ? this.props.marginStart : 0,
      marginRight: vertical ? this.props.marginEnd : 0,
      marginTop: vertical ? 0 : this.props.marginStart,
      marginBottom: vertical ? 0 : this.props.marginEnd
    };
    // the sole purpose of outter and inner bar is to recreate a kind of
    // inner border so that the border would meet the scale precisely
    var outterBarStyle = {
      flex: valueFlex,
      paddingTop: vertical ? this.props.borderBottomWidth : 0,
      paddingLeft: vertical ? 0 : this.props.borderBottomWidth
    };
    var orientationStyle = vertical ? barStyles.vertical : barStyles.horizontal;
    var innerBarStyle = {
      flex: 1,
      backgroundColor: this.props.fillColor,
      borderColor: this.props.borderColor,
      borderWidth: this.props.borderWidth,
      borderStyle: this.props.borderStyle
    };

    // render bar
    var bar = (
      <View key={'bar'} style={[outterBarStyle]}>
        <View style={[innerBarStyle, orientationStyle]} />
      </View>
    );
    // render anti bar
    var antiBarStyle = {
      flex: antiValueFlex
    };
    var antiBar = (
      <View key={'antiBar'} style={[antiBar, antiBarStyle]} />
    );
    var bars = [antiBar, bar];
    if (!vertical) {
      bars.reverse();
    }
    return (
      <View style={[barStyles.container, directionStyle, marginStyle]}>
        { bars }
      </View>
    );
  }
});

var barStyles = StyleSheet.create({
  container: {
    flex: 1
  },

  vertical: {
    borderBottomWidth: 0
  },

  horizontal: {
    borderLeftWidth: 0
  },

  antiBar: {
    backgroundColor: 'transparent'
  }
});

/**
  * BarSet: group of bars
  */
var BarSet = React.createClass({
  propTypes: {
    // passed to children
    orientation: ReactPropTypes.oneOf(['vertical', 'horizontal']),
    minValue: ReactPropTypes.number,
    maxValue: ReactPropTypes.number,
    borderStyle: ViewStylePropTypes.borderStyle,
    borderWidth: ReactPropTypes.number,
    // Extract value from ChartDatasetPropType
    dataValueSet: ReactPropTypes.arrayOf(
      ReactPropTypes.shape({
        name: ReactPropTypes.string,
        primaryColor: ReactPropTypes.string,
        secondaryColor: ReactPropTypes.string,
        value: ReactPropTypes.number.isRequired
      })
    ),

    margin: ReactPropTypes.number,
    barSpacing: ReactPropTypes.number
  },

  getDefaultProps(): Props {
    return {
      orientation: 'vertical'
    }
  },

  _renderBars: function(value, index, dataValueSet) {
    var barMargin = this.props.barSpacing / 2;
    var marginStart = (index > 0) ? barMargin : 0;
    var marginEnd = (index == dataValueSet.length - 1) ? 0 : barMargin;
    return (
      <Bar {...this.props}
        key={'bar-' + index}
        fillColor={value.primaryColor}
        borderColor={value.secondaryColor}
        value={value.value}
        marginStart={marginStart}
        marginEnd={marginEnd} />
    );
  },

  render: function() {
    var vertical = this.props.orientation == 'vertical';
    var marginStyle = {
      marginHorizontal: vertical ? this.props.margin : 0,
      marginVertical: vertical ? 0 : this.props.margin
    };
    return (
      <View style={[
          barSetStyles.container,
          barSetStyles[this.props.orientation],
          marginStyle
        ]}>
        { this.props.dataValueSet.map(this._renderBars) }
      </View>
    );
  }
});

var barSetStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between'
  },

  vertical: {
    flexDirection: 'row'
  },

  horizontal: {
    flexDirection: 'column'
  }
});

// get value range
var getValueRange = function(datasets) {
  var min = Number.MAX_VALUE;
  var max = 0;
  datasets.forEach(function(dataset, index) {
    min = Math.min(min, ...dataset.values);
    max = Math.max(max, ...dataset.values);
  });
  return { min, max };
};

// calculate the scale, need to extend scale below the min value
var calculateScale = function(datasets) {
  var range = getValueRange(datasets);

  // find out magnitude
  var log = Math.log(range.max);
  log = Math.floor(log);
  // lock to nearest tens only
  log = Math.min(log, 1);
  var factor = Math.pow(10, log);

  var min = Math.floor(range.min / factor) * factor;
  var max = Math.ceil(range.max / factor) * factor;
  var unit = (max - min) / 10;
  min -= unit;
  return {min, max, unit};
};

/**
  * BarChart component
  */
var BarChart = React.createClass({
  statics: {
    calculateScale: calculateScale
  },

  propTypes: {
    // Bar options
    // spacing between bars in bar set
    barSpacing: ReactPropTypes.number,
    // spacing between bar sets
    barSetSpacing: ReactPropTypes.number,
    // Border width of the bar, top, left and right border only
    barBorderWidth: ReactPropTypes.number,

    datasets: ReactPropTypes.arrayOf(ChartDatasetPropType).isRequired,

    // Scale of the chart
    valueScale: ChartScalePropType.isRequired,

    // Style
    orientation: ReactPropTypes.oneOf(['vertical', 'horizontal']),
    style: View.propTypes.style
  },

  getDefaultProps(): Props {
    return {
      barSpacing: 0,
      barSetSpacing: 10,
      barBorderWidth: 2,

      orientation: 'vertical'
    }
  },

  _ensureValueScaleCoverRange: function(props) {
    invariant(
      (props.valueScale != null),
      'valueScale is required'
    );
    var range = getValueRange(props.datasets);
    if (props.valueScale && props.valueScale.min) {
      invariant(
        (props.valueScale.min <= range.min),
        'valueScale.min: ' +
        props.valueScale.min +
        ', must be lesser or equal to the lowest dataset value: ' +
        range.min
      );
    }
    if (props.valueScale && props.valueScale.max) {
      invariant(
        (props.valueScale.max >= range.max),
        'valueScale.max: ' +
        props.valueScale.max +
        ', must be greater or equal to the highest dataset value: ' +
        range.max
      );
    }
    if (props.valueScale.unit) {
      invariant(
        (props.valueScale.unit < range.max && props.valueScale.unit > range.min),
        'valueScale.unit: ' +
        props.valueScale.unit +
        ', must be within the range of dataset values: ' +
        JSON.stringify(range)
      );
    }
  },

  _datasetsToDataValueSets: function() {
    var dataValueSets = [];
    this.props.datasets.forEach(function(dataset, dIndex) {
      dataset.values.forEach(function(value, vIndex){
        var dataValueSet = dataValueSets[vIndex];
        if (!dataValueSet) {
          dataValueSet = [];
          dataValueSets[vIndex] = dataValueSet;
        }
        dataValueSet[dIndex] = {
          name: dataset.name,
          primaryColor: dataset.primaryColor,
          secondaryColor: dataset.secondaryColor,
          value: value
        }
      });
    });
    return dataValueSets;
  },

  _renderBarSets: function(dataValueSet, index) {
    return (
      <BarSet key={'bar-set-' + index}
        orientation={this.props.orientation}
        minValue={this.props.valueScale.min}
        maxValue={this.props.valueScale.max}
        borderStyle={this.props.barBorderStyle}
        borderWidth={this.props.barBorderWidth}
        margin={this.props.barSetSpacing / 2}
        barSpacing={this.props.barSpacing}
        dataValueSet={dataValueSet}
        />
    );
  },

  componentWillMount: function() {
    this._ensureValueScaleCoverRange(this.props);
  },

  componentWillReceiveProps: function(nextProps) {
    this._ensureValueScaleCoverRange(nextProps);
  },

  render: function() {
    var dataValueSets = this._datasetsToDataValueSets();
    return (
      <View key='chart'
        style={[
          styles.container,
          styles[this.props.orientation],
          this.props.style
        ]}>
        {dataValueSets.map(this._renderBarSets)}
      </View>
    );
  }
});

// Common base styles
var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },

  vertical: {
    flexDirection: 'row'
  },

  horizontal: {
    flexDirection: 'column'
  }
});

module.exports = BarChart;
